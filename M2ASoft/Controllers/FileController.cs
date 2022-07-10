using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace M2ASoft.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly DataContext _context;


        public FileController(IUserService userService, DataContext context)
        {
            _userService = userService;
            _context = context;
        }

        [HttpPost("register/{uid}")]
        public async Task<IActionResult> OnPostUploadAsync(List<IFormFile> files,Guid uid)
        {
            if (files.Count == 0)
            {
                return BadRequest("files empty");
            }
            if (files.Count != 3)
            {
                return BadRequest("we need 3 files");
            }
            var user = await _context.Users.FindAsync(uid);
            if (user == null)
            {
                return BadRequest("User not exist");
            }

            long size = files.Sum(f => f.Length);
            long max_size = 9999999;
            string[] _extensions = new string[] { ".pdf", ".jpg", ".jpeg", ".png" };

            foreach (var formFile in files)
            {
                if (formFile == null || formFile.Length == 0)
                {
                    return BadRequest("File is empty");
                }
                if (formFile.Length > max_size)
                {
                    return BadRequest("large file");
                }
                var extension = Path.GetExtension(formFile.FileName);
                if (!_extensions.Contains(extension.ToLower()))
                {
                    return BadRequest("Type of file not allowed");
                }
            }
            string directoryPath = "F:\\M2ASoft\\documents\\" + uid.ToString();
            Directory.CreateDirectory(directoryPath);
            int i = 0;

            foreach (var formFile in files)
            {
                var extension = Path.GetExtension(formFile.FileName);

                string filePath = (i == 0) ? Path.Combine(directoryPath, "modeleJ") : (i == 1) ? Path.Combine(directoryPath, "statut") : Path.Combine(directoryPath, "cin");

                using (var stream = System.IO.File.Create(filePath + extension))
                {
                    await formFile.CopyToAsync(stream);
                }
                i++;
            }
            // Process uploaded files
            // Don't rely on or trust the FileName property without validation.

            return Ok(new { count = files.Count, size,uid });
        }

    }
}
