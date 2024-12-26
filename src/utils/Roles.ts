class UserRoles {

    public Admin: string
    public SuperAdmin: string
    public Company: string
    public User: string
    public Recruiter: string


    constructor() {
        this.Admin = "admin"
        this.SuperAdmin = "superadmin"
        this.Company = "employer"
        this.User = "user"
        this.Recruiter = "recruiter"
    }
}


export const roles = new UserRoles()