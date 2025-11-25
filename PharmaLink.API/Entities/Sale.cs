namespace PharmaLink.API.Entities
{
    public class Sale
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime TransDate { get; set; }
    }
}
