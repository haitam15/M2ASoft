using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace M2ASoft.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly DataContext _context;

        public UserController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<User>>> Get()
        {
            return Ok(await _context.Users.ToListAsync());
        }

        [HttpGet("{uid}")]
        public async Task<ActionResult<User>> Get(Guid uid)
        {
            var user = await _context.Users.FindAsync(uid);
            if (user == null)
                return BadRequest("User not found.");
            return Ok(user);
        }
        
        /*
        [HttpGet("{email}")]
        public async Task<ActionResult<User>> Get(string email)
        {
            var user = await _context.Users.FindAsync(uid);
            if (user == null)
                return BadRequest("User not found.");
            return Ok(user);
        }
        */

        [HttpPost]
        public async Task<ActionResult<List<User>>> AddUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(await _context.Users.ToListAsync());
        }

        [HttpPut]
        public async Task<ActionResult<List<User>>> UpdateUser(User request)
        {
            var user = await _context.Users.FindAsync(request.uid);
            if (user == null)
                return BadRequest("User not found.");

            user.raisonSocial = request.raisonSocial;
            user.responsable = request.responsable;
            user.email = request.email;
            user.num = request.num;
            user.gsm = request.gsm;
            user.domaineDactivite = request.domaineDactivite;
            user.PasswordHash = request.PasswordHash;
            user.PasswordSalt = request.PasswordSalt;
            user.RefreshToken = request.RefreshToken;
            user.TokenCreated = request.TokenCreated;
            user.TokenExpires = request.TokenExpires;

            await _context.SaveChangesAsync();

            return Ok(await _context.Users.ToListAsync());
        }

        [HttpDelete("{uid}")]
        public async Task<ActionResult<List<User>>> Delete(Guid uid)
        {
            var user = await _context.Users.FindAsync(uid);
            if (user == null)
                return BadRequest("User not found.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("Deleted");
        }

        [HttpGet("email/{email}"),Authorize(Roles ="Admin")]
        public ActionResult<User> Get(string email)
        {
            var user = _context.Users.Where(u => u.email == email).FirstOrDefault<User>();
            if (user == null)
            {
                return BadRequest("Email not found.");
            }
            return Ok(user);
        }

        [HttpPut("validate/{uid}"),Authorize(Roles ="Admin")]
        public async Task<IActionResult> Validate(Guid uid)
        {
            var user = await _context.Users.FindAsync(uid);
            if (user == null)
                return BadRequest("User not found.");

            user.etat = true;

            await _context.SaveChangesAsync();

            return Ok("User is validated");
        }


    }
}