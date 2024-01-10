class ApiResponse{
    constructor(statusCode,data,message = "Siccess"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}