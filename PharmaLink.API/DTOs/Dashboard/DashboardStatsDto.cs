namespace PharmaLink.API.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public decimal TotalRevenueToday { get; set; }
        public int TotalSalesToday { get; set; }
        public int LowStockItems { get; set; } // Items with < 10 stock
        public int ExpiringSoonItems { get; set; } // Items expiring in < 3 months
        public int TotalMedicines { get; set; }

        public List<SalesTrendDto> WeeklySales { get; set; } = new();
    }
    public class SalesTrendDto
    {
        public string DateLabel { get; set; } = string.Empty; // e.g., "Mon", "Tue"
        public decimal TotalAmount { get; set; }
    }
}