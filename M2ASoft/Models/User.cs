using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace M2ASoft.Models
{
    public class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public Guid uid { get; set; }

        //[MaxLength(10), MinLength(5)]
        public string raisonSocial { get; set; } = string.Empty;

        public string responsable { get; set; } = string.Empty;

        public string email { get; set; } = string.Empty;

        public string num { get; set; } = string.Empty;

        public string gsm { get; set; } = string.Empty;

        public string domaineDactivite { get; set; } = string.Empty;

        public Boolean etat { get; set; } = false;

        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime TokenCreated { get; set; }
        public DateTime TokenExpires { get; set; }
    }
}
