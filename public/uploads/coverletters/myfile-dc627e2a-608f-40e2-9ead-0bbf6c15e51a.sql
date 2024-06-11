-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 15, 2024 at 07:13 PM
-- Server version: 8.2.0
-- PHP Version: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `reper`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `stripe_customer_id` varchar(100) NOT NULL,
  `stripe_default_payment_method_id` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `stripe_customer_id`, `stripe_default_payment_method_id`, `created_at`, `updated_at`) VALUES
(1, 'netcapital', 'mir.adnan@netcapital.com', '$2b$17$2z15gmo5rl4BHcWQN/EhW.M3mawGTPgnt2EptDccv0GN41mIiStGS', 'Netcapital', 'Admin', 'cus_Pk0Dl0H8qXTRaf', 'pm_1OugBAEosiGjN8kd2HYbDy0W', '2024-03-15 11:16:55', '2024-03-16 00:43:19');

-- --------------------------------------------------------

--
-- Table structure for table `api_requests`
--

DROP TABLE IF EXISTS `api_requests`;
CREATE TABLE IF NOT EXISTS `api_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `query` varchar(100) DEFAULT NULL,
  `response` text,
  `admin_user_id` int NOT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=445 DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `api_requests`
--

INSERT INTO `api_requests` (`id`, `query`, `response`, `admin_user_id`, `date`) VALUES
(396, 'FIRST--LAST', '{\"status\":200,\"meta_data\":{\"first_name\":\"FIRST\",\"middle_name\":null,\"last_name\":\"LAST\",\"dob\":\"MM-DD-YYYY\",\"total_exceptions_count\":0,\"cached\":false,\"alerts\":[],\"excludes\":[\"speeding\",\"traffic\",\"driving\"]},\"result\":{\"qualified\":true,\"certificate_url\":\"http:\\/\\/api.reper.com\\/person\\/certificate?h=RklSU1QgTEFTVA==&api_key=a1d7c1c735d6e40b03f16eb5a9fedc66\"},\"exceptions\":[]}', 1, '2024-03-06 14:41:53'),
(423, 'FIRST--LAST', '{\"status\":200,\"meta_data\":{\"first_name\":\"FIRST\",\"middle_name\":null,\"last_name\":\"LAST\",\"dob\":\"MM-DD-YYYY\",\"total_exceptions_count\":0,\"cached\":false,\"alerts\":[],\"excludes\":[\"speeding\",\"traffic\",\"driving\"]},\"result\":{\"qualified\":true,\"certificate_url\":\"http:\\/\\/api.reper.com\\/person\\/certificate?h=RklSU1QgTEFTVA==&api_key=a1d7c1c735d6e40b03f16eb5a9fedc66\"},\"exceptions\":[]}', 1, '2017-12-29 16:53:06'),
(432, 'FIRST--LAST', '{\"status\":200,\"meta_data\":{\"first_name\":\"FIRST\",\"middle_name\":null,\"last_name\":\"LAST\",\"dob\":\"MM-DD-YYYY\",\"total_exceptions_count\":0,\"cached\":false,\"alerts\":[],\"excludes\":[\"speeding\",\"traffic\",\"driving\"]},\"result\":{\"qualified\":true,\"certificate_url\":\"http:\\/\\/api.reper.com\\/person\\/certificate?h=RklSU1QgTEFTVA==&api_key=a1d7c1c735d6e40b03f16eb5a9fedc66\"},\"exceptions\":[]}', 1, '2018-01-22 20:15:33'),
(435, 'FIRST--LAST', '{\"status\":200,\"meta_data\":{\"first_name\":\"FIRST\",\"middle_name\":null,\"last_name\":\"LAST\",\"dob\":\"MM-DD-YYYY\",\"total_exceptions_count\":0,\"cached\":false,\"alerts\":[],\"excludes\":[\"speeding\",\"traffic\",\"driving\"]},\"result\":{\"qualified\":true,\"certificate_url\":\"http:\\/\\/api.reper.com\\/person\\/certificate?h=RklSU1QgTEFTVA==&api_key=a1d7c1c735d6e40b03f16eb5a9fedc66\"},\"exceptions\":[]}', 0, '2018-01-23 01:36:57'),
(444, 'FIRST--LASTSSS', '{\"status\":200,\"meta_data\":{\"first_name\":\"FIRST\",\"middle_name\":null,\"last_name\":\"LAST\",\"dob\":\"MM-DD-YYYY\",\"total_exceptions_count\":0,\"cached\":false,\"alerts\":[],\"excludes\":[\"speeding\",\"traffic\",\"driving\"]},\"result\":{\"qualified\":true,\"certificate_url\":\"http:\\/\\/api.reper.com\\/person\\/certificate?h=RklSU1QgTEFTVA==&api_key=a1d7c1c735d6e40b03f16eb5a9fedc66\"},\"exceptions\":[]}', 0, '2018-01-29 19:08:58');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
