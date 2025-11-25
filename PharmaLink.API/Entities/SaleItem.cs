namespace PharmaLink.API.Entities
{
    public class SaleItem
    {
        public int Id { get; set; }
        public int SaleId { get; set; }
        public int MedicinesId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
