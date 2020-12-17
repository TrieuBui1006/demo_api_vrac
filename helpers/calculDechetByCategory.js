exports.calculByCategory = async (data) => {
    let dechetByCategory = []
        let arrTemp = []
        
        data.products.forEach(product => {
            arrTemp.push({
                category: product.category,
                amount: product.exchangeRatio*product.weight
            })
        })

        dechetByCategory = Array.from(arrTemp.reduce(
            (m, {category, amount}) => m.set(category, (m.get(category) || 0) + amount), new Map
        ), ([category, amount]) => ({category, amount}));
        
    return dechetByCategory
}