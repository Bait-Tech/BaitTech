using System.ComponentModel.DataAnnotations;

namespace ECommercePlatform.Server.Models.Identity
{
    public class Login
    {
        [Required]
        public string? Email { get; set; }
        [Required]
        public string? Password { get; set; }
    }
}
