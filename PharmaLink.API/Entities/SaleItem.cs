namespace PharmaLink.API.Entities
{
    public class SaleItem
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
