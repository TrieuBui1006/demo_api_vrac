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

exports.calculTotalByCategory = async (data) => {
    let totalByCategory = []
    let arrTemp = []

    data.forEach(order => {
        order.dechetByCategory.forEach(category => {
            arrTemp.push({
                category: category.category,
                amount: category.amount
            })
        })
    })

    totalByCategory = Array.from(arrTemp.reduce(
        (m, {category, amount}) => m.set(category, (m.get(category) || 0) + amount), new Map
    ), ([category, amount]) => ({category, amount}));

    return totalByCategory
}

exports.calculTotalDechets = async (data) => {
    let totalDechets = 0

    data.forEach(order => {
        order.dechetByCategory.forEach(category => {
                totalDechets = totalDechets + category.amount
            })
        })

    return totalDechets
}