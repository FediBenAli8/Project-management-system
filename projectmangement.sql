
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

create database jeeProj;

CREATE TABLE `ai_suggestion` (
  `id` int(11) NOT NULL,
  `is_accepted` int(11) NOT NULL DEFAULT 0,
  `project_id` int(11) NOT NULL,
  `prompt_input` text DEFAULT NULL,
  `suggested_structure` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;







CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `leader` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;





INSERT INTO `project` (`id`, `title`, `description`, `leader`, `created_at`) VALUES
(1, 'test', 'test test', 1, '2026-04-13 11:53:59'),
(2, 'test projet', 'awel projet test test ', 1, '2026-04-13 19:13:57'),
(3, 'test 2', 'hhhhhhhhhhhhh', 1, '2026-04-13 21:13:38'),
(4, 'mouhib', 'rrrr', 1, '2026-04-13 21:16:58'),
(5, 'mouihb', 'hhhhh', 1, '2026-04-14 15:54:05');







CREATE TABLE `project_members` (
  `project_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;







CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `feedback` text DEFAULT NULL,
  `is_approved` int(11) NOT NULL DEFAULT 0,
  `submission_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `reviewed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;







CREATE TABLE `submission` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `filepath` varchar(500) NOT NULL,
  `submissionNote` text DEFAULT NULL,
  `submitted_by` int(11) NOT NULL,
  `subtask_id` int(11) NOT NULL,
  `review_status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `review_comment` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;







CREATE TABLE `subtasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `status` varchar(100) NOT NULL,
  `weight_percentage` double NOT NULL DEFAULT 0,
  `task_id` int(11) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;







CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;





INSERT INTO `tasks` (`id`, `project_id`, `title`, `created_by`) VALUES
(1, 2, 'task test 1 ', 1),
(2, 2, 'task test 2', 1),
(3, 3, 'test task 111', 1),
(4, 4, 'task1', 1),
(5, 5, 'task1', 1);







CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;





INSERT INTO `user` (`id`, `username`, `role`, `email`, `password`, `created_at`) VALUES
(1, 'mouhib', 'team leader', 'mouhib', 'mouhib', '2026-04-12 11:52:33');








ALTER TABLE `ai_suggestion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);




ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leader` (`leader`);




ALTER TABLE `project_members`
  ADD PRIMARY KEY (`project_id`,`member_id`),
  ADD KEY `member_id` (`member_id`);




ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);




ALTER TABLE `submission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submitted_by` (`submitted_by`),
  ADD KEY `subtask_id` (`subtask_id`);




ALTER TABLE `subtasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `assigned_to` (`assigned_to`);




ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `created_by` (`created_by`);




ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);








ALTER TABLE `ai_suggestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;




ALTER TABLE `project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;




ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;




ALTER TABLE `submission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;




ALTER TABLE `subtasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;




ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;




ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;








ALTER TABLE `ai_suggestion`
  ADD CONSTRAINT `ai_suggestion_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`ID`);




ALTER TABLE `project`
  ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`leader`) REFERENCES `user` (`ID`);




ALTER TABLE `project_members`
  ADD CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`ID`),
  ADD CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `user` (`ID`);




ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submission` (`ID`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `user` (`ID`);




ALTER TABLE `submission`
  ADD CONSTRAINT `submission_ibfk_1` FOREIGN KEY (`submitted_by`) REFERENCES `user` (`ID`),
  ADD CONSTRAINT `submission_ibfk_2` FOREIGN KEY (`subtask_id`) REFERENCES `subtasks` (`ID`);




ALTER TABLE `subtasks`
  ADD CONSTRAINT `subtasks_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`ID`),
  ADD CONSTRAINT `subtasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `user` (`ID`);




ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`ID`),
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `user` (`ID`);
COMMIT;

;
;
;
