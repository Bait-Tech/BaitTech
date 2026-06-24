using ECommercePlatform.Server.Entities.Base;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECommercePlatform.Server.Entities.Main
{
    public class SubCategory : CrudBase
    {
        public required string ArabicName { get; set; }
        public string? EnlgishName { get; set; }
        public int? CategoryID { get; set; }
        public string? ImageUrl { get; set; }


        [ForeignKey("CategoryID")]
        public Category? Category { get; set; }
    }
}
