export class CreateUserDto {
  created_date: Date
  first_name: string
  last_name: string
  email: string
  password: string
  phone: number
  role: string
  plan: string
  amount_paid: string
  activated: boolean
  token: string
  credits:number 
  usedFreeCredit:boolean
}