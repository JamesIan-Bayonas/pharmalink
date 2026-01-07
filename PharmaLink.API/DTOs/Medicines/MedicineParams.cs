namespace PharmaLink.API.DTOs.Medicines
{
    public class MedicineParams
    {
        // 1. PAGINATION DEFAULTS
        private const int MaxPageSize = 50; // Prevent users from requesting 1,000,000 rows
        public int PageNumber { get; set; } = 1; // Default to Page 1

        private int _pageSize = 10; // Default to 10 items
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }

        // 2. SEARCH & FILTERING
        public string? SearchTerm { get; set; } // e.g., "Biogesic"
        public int? CategoryId { get; set; } // e.g., 5 (Antibiotics)

        // 3. SORTING
        // Options: "name", "price", "price_desc", "expiry"
        public string? SortBy { get; set; }
        public string? Filter { get; set; }
    }
}