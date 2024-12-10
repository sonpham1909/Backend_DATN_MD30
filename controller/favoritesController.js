// controllers/favoritesController.js
const Favorite = require("../models/Favorite");

const FavoriteController = {
  toggleFavorite: async (req, res) => {
    const { productId } = req.body;
    const userId = req.user?.id;

    // Kiểm tra xem productId có tồn tại không
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    console.log("Product ID:", productId);
    console.log("User ID:", userId);

    try {
      // Kiểm tra xem sản phẩm đã được yêu thích chưa
      const favorite = await Favorite.findOne({ userId, productId });

      if (favorite) {
        // Nếu sản phẩm đã có trong yêu thích, xóa nó khỏi danh sách
        await Favorite.deleteOne({ userId, productId });
        return res.json({
          message: "Removed from favorites",
          productId,
          isFavorite: false,
        });
      } else {
        // Nếu chưa có, thêm sản phẩm vào danh sách yêu thích
        await Favorite.create({ userId, productId });
        return res.json({
          message: "Added to favorites",
          productId,
          isFavorite: true,
        });
      }
    } catch (error) {
      console.error("Error in toggleFavorite:", error.message);
      return res.status(500).json({ error: "Error toggling favorite" });
    }
  },

  getFavorites: async (req, res) => {
    const userId = req.user?.id;
  
    try {
      const favorites = await Favorite.find({ userId }).populate("productId");
  
      if (!favorites || favorites.length === 0) {
        return res.status(200).json({ message: "No favorites found", favorites: [] });
      }
  
      const favoriteProducts = favorites.map(fav => fav.productId); // lấy toàn bộ thông tin của sản phẩm
      return res.status(200).json({ favorites: favoriteProducts });
    } catch (error) {
      console.error("Error fetching favorites:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }


  
};

module.exports = FavoriteController;
