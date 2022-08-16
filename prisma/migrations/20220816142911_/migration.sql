-- CreateTable
CREATE TABLE `categorys` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(220) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clusters` (
    `cluster_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cluster_name` VARCHAR(220) NOT NULL,

    PRIMARY KEY (`cluster_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `employee_id` VARCHAR(45) NOT NULL,
    `user_id` VARCHAR(45) NULL,
    `first_name` VARCHAR(200) NOT NULL,
    `last_name` VARCHAR(200) NOT NULL,
    `gender` ENUM('F', 'M') NOT NULL,
    `birth_day` DATE NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `join_date` DATE NULL,
    `end_date` DATE NULL,
    `job_title` VARCHAR(200) NOT NULL,
    `image` VARCHAR(220) NOT NULL DEFAULT 'default.jpg',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_user_id_key`(`user_id`),
    INDEX `fk_employees_users_idx`(`user_id`),
    PRIMARY KEY (`employee_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `orderId` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` VARCHAR(45) NOT NULL,
    `employee_id` VARCHAR(45) NOT NULL,
    `order_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` FLOAT NULL,

    INDEX `fk_orders_employees1_idx`(`employee_id`),
    INDEX `fk_orders_stores1_idx`(`store_id`),
    PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oreders_detail` (
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `fk_oreders_detail_orders1_idx`(`order_id`),
    INDEX `fk_oreders_detail_products1_idx`(`product_id`),
    PRIMARY KEY (`order_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `supplier_id` INTEGER NOT NULL,
    `product_name` VARCHAR(220) NOT NULL,
    `price` FLOAT NOT NULL,
    `description` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_products_categorys1_idx`(`category_id`),
    INDEX `fk_products_suppliers1_idx`(`supplier_id`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `store_id` VARCHAR(45) NOT NULL,
    `sub_cluster_id` INTEGER NULL,
    `store_name` VARCHAR(250) NOT NULL,
    `owner_name` VARCHAR(199) NULL,
    `address` TEXT NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_store_sub_cluster1_idx`(`sub_cluster_id`),
    PRIMARY KEY (`store_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_clusters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cluster_id` INTEGER NOT NULL,
    `subClusterName` VARCHAR(200) NULL,

    INDEX `fk_sub_cluster_cluster1_idx`(`cluster_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `supplier_id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_name` VARCHAR(220) NOT NULL,
    `address` TEXT NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`supplier_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(45) NOT NULL,
    `email` VARCHAR(220) NOT NULL,
    `password_hash` VARCHAR(250) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `refresh_token` TEXT NULL,
    `role` ENUM('SUPERADMIN', 'ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verifiedEmail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `expired` INTEGER NOT NULL DEFAULT 3600,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `verifiedEmail_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `task_id` INTEGER NOT NULL AUTO_INCREMENT,
    `assign_to` VARCHAR(45) NOT NULL,
    `result_id` INTEGER NOT NULL,
    `store_id` VARCHAR(45) NOT NULL,
    `status` ENUM('NOTREAD', 'READ', 'VISITED') NOT NULL,
    `schedule_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `schedule_next` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_tasks_employess1_idx`(`assign_to`),
    INDEX `fk_tasks_result1_idx`(`result_id`),
    PRIMARY KEY (`task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks_result` (
    `result_id` INTEGER NOT NULL AUTO_INCREMENT,
    `result` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`result_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `fk_employees_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_employees1` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`employee_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_stores1` FOREIGN KEY (`store_id`) REFERENCES `stores`(`store_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oreders_detail` ADD CONSTRAINT `fk_oreders_detail_orders1` FOREIGN KEY (`order_id`) REFERENCES `orders`(`orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oreders_detail` ADD CONSTRAINT `fk_oreders_detail_products1` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_categorys1` FOREIGN KEY (`category_id`) REFERENCES `categorys`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_suppliers1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `fk_store_sub_cluster1` FOREIGN KEY (`sub_cluster_id`) REFERENCES `sub_clusters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_clusters` ADD CONSTRAINT `fk_sub_cluster_cluster1` FOREIGN KEY (`cluster_id`) REFERENCES `clusters`(`cluster_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verifiedEmail` ADD CONSTRAINT `verifiedEmail_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `fk_task_result1` FOREIGN KEY (`result_id`) REFERENCES `tasks_result`(`result_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `fk_tasks_employee1` FOREIGN KEY (`assign_to`) REFERENCES `employees`(`employee_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
