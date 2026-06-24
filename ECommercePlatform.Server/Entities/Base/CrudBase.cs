using System.ComponentModel.DataAnnotations;

namespace ECommercePlatform.Server.Entities.Base
{
    public class CrudBase
    {
        [Key]
        public int ID { get; set; }

        public string? CreatedBy { get; set; } = "";
        public DateTime? CreatedAt { get; set; }

        public string? UpdatedBy { get; set; } = "";
        public DateTime? UpdatedAt { get; set; }
    }
}
