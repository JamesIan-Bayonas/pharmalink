namespace PharmaLink.API.Entities
{
    public class Medicine
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public int StackQuantity { get; set; }
        public decimal Price { get; set; }
    }
}
