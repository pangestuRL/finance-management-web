export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
}
