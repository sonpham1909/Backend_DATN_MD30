const SearchHistory = require("../models/SearchHistory");

const searchController = {
    addSearch: async (req, res) => {
        const { searchTerm } = req.body;
    
        try {
            await SearchHistory.findOneAndDelete({
                user_id: req.user.id,
                search_term: searchTerm,
            });
    
            const searchHistory = new SearchHistory({
                user_id: req.user.id,
                search_term: searchTerm,
            });
    
            await searchHistory.save();
            res.status(200).send("Search term saved successfully");
        } catch (error) {
            console.error("Error saving search term:", error);
            res.status(500).json({ message: "Error saving search term" });
        }
    },
    
    getHistoryUser: async (req, res) => {
        try {
            const userId = req.user.id;

            const searchHistory = await SearchHistory.find({ user_id: userId })
                .sort({ createdAt: -1 });

            const uniqueSearchTerms = [];
            const seenTerms = new Set();

            searchHistory.forEach((item) => {
                if (!seenTerms.has(item.search_term)) {
                    uniqueSearchTerms.push(item);
                    seenTerms.add(item.search_term);
                }
            });

            res.status(200).json(uniqueSearchTerms);
        } catch (error) {
            res.status(500).json({ message: "Error getting search term" });
        }
    },
    
    deleteSearchTerm: async (req, res) => {
        const searchId = req.params.id;

        try {
            await SearchHistory.findByIdAndDelete(searchId);
            res.status(200).json({ message: "Search term deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting search term" });
        }
    },

    // Phương thức mới để xóa toàn bộ lịch sử tìm kiếm của người dùng
    deleteAllSearchTerms: async (req, res) => {
        try {
            const userId = req.user.id;

            // Xóa toàn bộ lịch sử tìm kiếm của người dùng dựa trên user_id
            await SearchHistory.deleteMany({ user_id: userId });

            res.status(200).json({ message: "All search terms deleted successfully" });
        } catch (error) {
            console.error("Error deleting all search terms:", error);
            res.status(500).json({ message: "Error deleting all search terms" });
        }
    }
};

module.exports = searchController;
