# Scentence E-Commerce Backend

Welcome to the Scentence E-Commerce Backend repository. This README serves as a comprehensive guide to the project's structure, setup instructions, features, API endpoints, additional information, resources, and contributions.

**This project is live and deployed! Access it [here](https://scentence.vercel.app/).**

**The frontend repository is [here](https://github.com/mostafaroshdy1/scentence-frontend).**

## Project Overview

Scentence is an innovative e-commerce platform designed to deliver a seamless shopping experience across various product categories. The backend repository houses the server-side code, responsible for handling authentication, product management, order processing, user management, and other essential functionalities.

## Features

### Authentication

- **Secure JWT Authentication:** User authentication is implemented using JSON Web Tokens (JWT), ensuring robust data integrity and user privacy.
- **Middleware for Authentication and Authorization:** Middleware functions are employed to authenticate and authorize user requests, ensuring secure access to protected endpoints.

### Product Management

- **Product CRUD Operations:** A comprehensive set of endpoints is provided to facilitate Create, Read, Update, and Delete (CRUD) operations for managing products.
- **Efficient Image Upload:** Administrators can effortlessly add product images through **Cloudinary integration**, simplifying the product management process and ensuring optimal visual representation.

### Order Management

- **Streamlined Order Processing:** Users can seamlessly place orders for desired products, with features like re-order for easy and fast ordering.
- **Order State Management:** Administrators possess the capability to efficiently manage orders, including categorization into pending, accepted, or rejected states, ensuring streamlined order fulfillment.

### User Management

- **Personalized Profile Management:** Users can view and edit their profile information, including the ability to upload profile pictures using **Cloudinary integration**, enhancing personalization and user experience.
- **Comprehensive User Authentication:** Robust authentication mechanisms are implemented to validate user credentials and ensure secure access to sensitive user data and functionalities.

### Additional Features

- **Dynamic Category Filtering:** Users can filter products based on categories for enhanced browsing experience, facilitating efficient product discovery and exploration.
- **Seamless Online Payment Integration:** Integration with **Stripe** allows users to make secure online payments, enhancing convenience and security.
- **Wishlist Management:** Users can add, view, update, and delete items from their wishlist for future reference or purchase, fostering engagement and customer retention.
- **Redis Integration:** **Redis** is utilized for caching frequently accessed data and optimizing query performance, ensuring optimal scalability and responsiveness of the application. Implemented cart & wishlist with Redis server for faster data retrieval.
- **Dockerized Deployment:** The backend application is containerized using Docker, facilitating seamless deployment and ensuring consistency across different environments. Dockerized the Node app with Redis image using Docker Compose for fast and easy deployment.

## Setup Instructions

### Using Docker (Recommended & Easier)

1. Ensure you have Docker installed on your system. If not, follow the official [Docker documentation](https://docs.docker.com/get-docker/) for installation instructions.
2. Clone this repository to your local machine.
3. Navigate to the project directory.
4. Set up environment variables for sensitive data such as database connection string, JWT secret, **Cloudinary credentials**, **Stripe API key**, and **Redis connection details** based on the provided `.env.example`.
5. Run the Docker container using the following command:
   ```
   sudo docker-compose up
   ```

### Through the Package Manager

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies by executing the following command:
   ```
   npm install
   ```
4. Ensure Redis is installed on your system. If not, install it using your system's package manager. For example, on systems using DNF package manager (such as Fedora), you can install Redis with the following command:
   ```
   sudo dnf install redis
   ```
5. Start the Redis server using the following command:
   ```
   sudo systemctl start redis
   ```
6. Set up environment variables for sensitive data as mentioned above.
7. Run the project using the following command:
   ```
   npm run dev
   ```

Choose the method that best suits your environment and preferences to get the Scentence E-Commerce Backend up and running smoothly.


## Additional Information

- **Data Validation and Sanitization:** Input data is rigorously validated and sanitized to prevent security vulnerabilities such as SQL injection and cross-site scripting (XSS) attacks, ensuring robust data integrity and user security.
- **Robust Error Handling:** Comprehensive error handling mechanisms are implemented to provide informative error messages and ensure a smooth user experience, enhancing user satisfaction and trust.

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Stripe Documentation](https://stripe.com/docs)
- [JWT Documentation](https://jwt.io/introduction/)
- [Multer Documentation](https://www.npmjs.com/package/multer)
- [Redis Integration with Node.js](https://www.npmjs.com/package/redis)
- [Docker Documentation](https://docs.docker.com/)

## Video Demo

Explore a comprehensive demonstration of the Scentence E-Commerce in action via the following video:

[![Scentence E-Commerce Demo](https://img.youtube.com/vi/FfvFiVY5YCY/0.jpg)](https://www.youtube.com/watch?v=FfvFiVY5YCY)

## Contributors

Contributions to the enhancement and evolution of the Scentence E-Commerce Backend are warmly welcomed from all passionate developers and enthusiasts.

- [@engyahmed7](https://github.com/engyahmed7)
- [@mostafaroshdy1](https://github.com/mostafaroshdy1)
- [@MalakNasser](https://github.com/MalakNasser)
- [@BasmalaMohamed46](https://github.com/BasmalaMohamed46)
- [@Belal-Abo-Ata](https://github.com/Belal-Abo-Ata)
- [@Ziad-Elganzory](https://github.com/Ziad-Elganzory)

Feel free to contribute to this project by submitting pull requests or opening issues for any bugs or feature requests.
