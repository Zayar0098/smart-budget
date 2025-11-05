import CategoryCard from './CategoryCard'

export default function CategoryList() {
  interface Category {
    name: string
    spent: number
  }

  const categories: Category[] = [
    { name: 'Rent house', spent: 25000 },
    { name: 'Gas bill', spent: 8000 },
    { name: 'Electric bill', spent: 6000 },
    { name: 'Water bill', spent: 4000 },
    { name: 'Coffee', spent: 1500 },
    { name: 'Snack', spent: 1200 },
    { name: 'Juice', spent: 900 },
    { name: 'Water', spent: 700 }
  ]

  return (
    <section className="categories">
      {categories.map((cat) => (
        <CategoryCard key={cat.name} title={cat.name} amount={cat.spent} />
      ))}
    </section>
  )
}
