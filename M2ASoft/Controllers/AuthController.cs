using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace M2ASoft.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly DataContext _context;


        public AuthController(IConfiguration configuration, IUserService userService, DataContext context)
        {
            _configuration = configuration;
            _userService = userService;
            _context = context;
        }

        [HttpGet, Authorize]
        public ActionResult<string> GetMe()
        {
            var email = _userService.GetMyEmail();
            return Ok(email);
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserRegister request)
        {
            if(request == null)
            {
                return BadRequest("No user");
            }
            if (string.IsNullOrEmpty(request.email))
            {
                return BadRequest("email is empty !");
            }
            if (string.IsNullOrEmpty(request.password))
            {
                return BadRequest("password is empty !");
            }
            if (string.IsNullOrEmpty(request.confirmPassword))
            {
                return BadRequest("confirmPassword is empty !");
            }
            if (string.IsNullOrEmpty(request.raisonSocial))
            {
                return BadRequest("raisonSocial is empty !");
            }
            if (string.IsNullOrEmpty(request.responsable))
            {
                return BadRequest("responsable is empty !");
            }
            if (string.IsNullOrEmpty(request.num))
            {
                return BadRequest("numTelephone is empty !");
            }
            if (string.IsNullOrEmpty(request.gsm))
            {
                return BadRequest("gsm is empty !");
            }
            if (string.IsNullOrEmpty(request.domaineDactivite))
            {
                return BadRequest("domaineDactivite is empty !");
            }
            if (!request.password.Equals(request.confirmPassword))
            {
                return BadRequest("Confirm password and password are not the same");
            }
            var user = _context.Users.Where(u => u.email == request.email).FirstOrDefault<User>();
            if (user != null)
            {
                return BadRequest("Email already exists.");
            }
            user = _context.Users.Where(u => u.num == request.num).FirstOrDefault<User>();
            if (user != null)
            {
                return BadRequest("Num already exists.");
            }
            user = _context.Users.Where(u => u.gsm == request.gsm).FirstOrDefault<User>();
            if (user != null)
            {
                return BadRequest("Gsm already exists.");
            }

            user = new User { email = request.email, raisonSocial = request.raisonSocial, responsable = request.responsable, num = request.num, gsm = request.gsm, domaineDactivite = request.domaineDactivite };

            CreatePasswordHash(request.password, out byte[] passwordHash, out byte[] passwordSalt);

            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();


            return Ok(user);
        }

        /*
        [HttpPost("changePassword")]
        public async Task<ActionResult<User>> Register(UserDTO request)
        {
            if (string.IsNullOrEmpty(request.password))
            {
                return BadRequest("password is empty !");
            }

            if (!request.password.Equals(request.confirmPassword))
            {
                return BadRequest("Password and confirm password are not the same !");
            }

            CreatePasswordHash(request.password, out byte[] passwordHash, out byte[] passwordSalt);

            user.Username = request.Username;
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;

            return Ok(user);
        }
        */


        [HttpPost("loginU")]
        public async Task<ActionResult<string>> Login(UserLogin request)
        {
            if (request == null)
            {
                return BadRequest("No user");
            }
            if (string.IsNullOrEmpty(request.email))
            {
                return BadRequest("email is empty !");
            }
            if (string.IsNullOrEmpty(request.password))
            {
                return BadRequest("password is empty !");
            }

            var user = _context.Users.Where( u => u.email == request.email).FirstOrDefault<User>();
            if (user == null)
            {
                return BadRequest("Email not found.");
            }

            if (!user.etat)
            {
                return BadRequest("you are not yet validated by the admin");
            }

            if (!VerifyPasswordHash(request.password, user.PasswordHash, user.PasswordSalt))
            {
                return BadRequest("Wrong password.");
            }

            string token = CreateToken(user);

            var refreshToken = GenerateRefreshToken();
            await SetRefreshToken(refreshToken,user);

            return Ok(token);
        }

        [HttpPost("loginA")]
        public async Task<ActionResult<string>> Login(AdminLogin request)
        {
            if (request == null)
            {
                return BadRequest("No Admin");
            }
            if (string.IsNullOrEmpty(request.username))
            {
                return BadRequest("Name is empty !");
            }
            if (string.IsNullOrEmpty(request.password))
            {
                return BadRequest("password is empty !");
            }

            var admin = await _context.Admins.FindAsync(request.username);
            if (admin == null)
            {
                return BadRequest("Admin not found.");
            }

            if (!VerifyPasswordHash(request.password, admin.PasswordHash, admin.PasswordSalt))
            {
                return BadRequest("Wrong password.");
            }

            string token = CreateToken(admin);

            var refreshToken = GenerateRefreshToken();
            await SetRefreshToken(refreshToken, admin);

            return Ok(token);
        }


        [HttpGet("refresh-token/{uid}")]
        public async Task<ActionResult<string>> RefreshToken(Guid uid)
        {
            var refreshToken = Request.Cookies["refreshToken"];

            var user = await _context.Users.FindAsync(uid);
            if (user == null)
                return BadRequest("User not found.");

            if (!user.RefreshToken.Equals(refreshToken))
            {
                return Unauthorized("Invalid Refresh Token.");
            }
            else if (user.TokenExpires < DateTime.Now)
            {
                return Unauthorized("Token expired.");
            }

            string token = CreateToken(user);
            var newRefreshToken = GenerateRefreshToken();
            await SetRefreshToken(newRefreshToken,user);

            return Ok(token);
        }

        [HttpGet("refresh-token-admin/{name}")]
        public async Task<ActionResult<string>> RefreshToken(string name)
        {
            var refreshToken = Request.Cookies["refreshToken"];

            var admin = await _context.Admins.FindAsync(name);
            if (admin == null)
                return BadRequest("admin not found.");

            if (!admin.RefreshToken.Equals(refreshToken))
            {
                return Unauthorized("Invalid Refresh Token.");
            }
            else if (admin.TokenExpires < DateTime.Now)
            {
                return Unauthorized("Token expired.");
            }

            string token = CreateToken(admin);
            var newRefreshToken = GenerateRefreshToken();
            await SetRefreshToken(newRefreshToken, admin);

            return Ok(token);
        }


        private RefreshToken GenerateRefreshToken()
        {
            var refreshToken = new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                Expires = DateTime.Now.AddDays(1),
                Created = DateTime.Now
            };

            return refreshToken;
        }

        private async Task SetRefreshToken(RefreshToken newRefreshToken, Object obj)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = newRefreshToken.Expires,
                SameSite = SameSiteMode.None,
                Secure = true
            };
            Response.Cookies.Append("refreshToken", newRefreshToken.Token, cookieOptions);

            User user;
            Admin admin;

            if (obj is User)
            {
                user = obj as User;
                user.RefreshToken = newRefreshToken.Token;
                user.TokenCreated = newRefreshToken.Created;
                user.TokenExpires = newRefreshToken.Expires;

            }
            else if (obj is Admin)
            {
                admin = obj as Admin;
                admin.RefreshToken = newRefreshToken.Token;
                admin.TokenCreated = newRefreshToken.Created;
                admin.TokenExpires = newRefreshToken.Expires;

            }

            await _context.SaveChangesAsync();
        }

        private string CreateToken(Object obj)
        {
            User user;
            Admin admin;
            List<Claim> claims = new List<Claim>();

            if (obj is User)
            {
                user = obj as User;
                claims = new List<Claim>
                {
                    new Claim("uid", user.uid.ToString()),
                    new Claim("email", user.email),
                    new Claim("role", "User")
                };
            }
            else if (obj is Admin)
            {
                admin = obj as Admin;
                claims = new List<Claim>
                {
                    new Claim("name", admin.Name),
                    new Claim("role", "Admin")
                };
            }

            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }

        /*
        [HttpGet("pass/{pass}")]
        public ActionResult getPass(string pass)
        {
            //byte[] passwordHash, passwordSalt;
            CreatePasswordHash(pass, out byte[] passwordHash, out byte[] passwordSalt);
            return Ok( new { passwordHash, passwordSalt } );
        }

        [HttpPost("admin")]
        public async Task<ActionResult> addAdmin(AdminLogin request)
        {
            Admin admin = new Admin {Name = request.Name };
            CreatePasswordHash(request.password, out byte[] passwordHash, out byte[] passwordSalt);
            admin.PasswordSalt = passwordSalt;
            admin.PasswordHash = passwordHash;
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return Ok( "added" );
        }
        */
    }
}