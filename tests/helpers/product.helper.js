import Product from "../../models/product.js";

/**
 * Returns a valid product object for testing purposes.
 * 
 * @param {Object} overrides - Fields to override in the default product data
 * @returns {Object} Complete product data object with all required fields
 */
export const getValidProductData = (overrides = {}) => {
    const timestamp = Date.now();
    return {
        slug: `test-product`,
        name: "Test Product",
        category: "Test Category",
        description: "Test Description",
        basePriceCHF: 10,
        image: "https://example.com/image.jpg",
        isActive: true,
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 },
        ...overrides
    };
};

/**
 * Creates and saves a product in the database.
 * 
 * @param {Object} overrides - Fields to override in the default product data
 * @returns {Promise<Object>} Created product instance
 */
export const createProduct = async (overrides = {}) => {
    const product = new Product(getValidProductData(overrides));
    await product.save();
    return product;
};

/**
 * Creates multiple products in the database.
 * 
 * @param {number} count - Number of products to create
 * @param {Object} baseOverrides - Base overrides for all products
 * @returns {Promise<Array>} Array of created products
 */
export const createMultipleProducts = async (count = 5, baseOverrides = {}) => {
    const products = [];
    for (let i = 0; i < count; i++) {
        const product = await createProduct({
            slug: `product-${i}`,
            name: `Product ${i}`,
            basePriceCHF: 10 + i,
            ...baseOverrides
        });
        products.push(product);
    }
    return products;
};

/**
 * Product test data fixtures.
 */
export const productFixtures = {
    valid: getValidProductData(),
    missingSlug: { name: "Product", category: "Cat", description: "Desc", basePriceCHF: 10, image: "url" },
    missingName: { slug: "slug", category: "Cat", description: "Desc", basePriceCHF: 10, image: "url" },
    invalidPrice: getValidProductData({ basePriceCHF: -10 }),
    inactive: getValidProductData({ isActive: false })
};