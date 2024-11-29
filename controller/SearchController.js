const SearchHistory = require("../models/SearchHistory");


const searchController = {
    addSearch : async(req, res)=>{

        const { searchTerm } = req.body;
        const searchHistory = new SearchHistory({
            user_id: req.user.id,
            search_term: searchTerm
        });
    
        try {
            await searchHistory.save();
            res.status(200).send("Search term saved successfully");
        } catch (error) {
            res.status(500).json({message:"Error saving search term"});
        }
    },

    getHistoryUser: async (req, res) => {
        try {
            const userId = req.user.id;

            // Lấy tất cả lịch sử tìm kiếm của người dùng, sắp xếp từ mới đến cũ
            const searchHistory = await SearchHistory.find({ user_id: userId })
                .sort({ createdAt: -1 });

            // Sử dụng Map để loại bỏ các từ khóa trùng nhau, chỉ giữ lại từ khóa mới nhất
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
        const searchId = req.params.id; // Lấy search_id từ params

        try {
            await SearchHistory.findByIdAndDelete(searchId);
            res.status(200).json({ message: "Search term deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting search term" });
        }
    }


}

module.exports = searchController;