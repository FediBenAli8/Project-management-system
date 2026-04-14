-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 14 avr. 2026 à 17:07
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `projectmangement`
--

-- --------------------------------------------------------

--
-- Structure de la table `ai_suggestion`
--

CREATE TABLE `ai_suggestion` (
  `id` int(11) NOT NULL,
  `is_accepted` int(11) NOT NULL DEFAULT 0,
  `project_id` int(11) NOT NULL,
  `prompt_input` text DEFAULT NULL,
  `suggested_structure` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `project`
--

CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `leader` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `project`
--

INSERT INTO `project` (`id`, `title`, `description`, `leader`, `created_at`) VALUES
(1, 'test', 'test test', 1, '2026-04-13 11:53:59'),
(2, 'test projet', 'awel projet test test ', 1, '2026-04-13 19:13:57'),
(3, 'test 2', 'hhhhhhhhhhhhh', 1, '2026-04-13 21:13:38'),
(4, 'mouhib', 'rrrr', 1, '2026-04-13 21:16:58'),
(5, 'mouihb', 'hhhhh', 1, '2026-04-14 15:54:05');

-- --------------------------------------------------------

--
-- Structure de la table `project_members`
--

CREATE TABLE `project_members` (
  `project_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `feedback` text DEFAULT NULL,
  `is_approved` int(11) NOT NULL DEFAULT 0,
  `submission_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `reviewed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `submission`
--

CREATE TABLE `submission` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `filepath` varchar(500) NOT NULL,
  `submissionNote` text DEFAULT NULL,
  `submitted_by` int(11) NOT NULL,
  `subtask_id` int(11) NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `subtasks`
--

CREATE TABLE `subtasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `status` varchar(100) NOT NULL,
  `weight_percentage` double NOT NULL DEFAULT 0,
  `task_id` int(11) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tasks`
--

INSERT INTO `tasks` (`id`, `project_id`, `title`, `created_by`) VALUES
(1, 2, 'task test 1 ', 1),
(2, 2, 'task test 2', 1),
(3, 3, 'test task 111', 1),
(4, 4, 'task1', 1),
(5, 5, 'task1', 1);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `username`, `role`, `email`, `password`, `created_at`) VALUES
(1, 'mouhib', 'team leader', 'mouhib', 'mouhib', '2026-04-12 11:52:33');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `ai_suggestion`
--
ALTER TABLE `ai_suggestion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Index pour la table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leader` (`leader`);

--
-- Index pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`project_id`,`member_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Index pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Index pour la table `submission`
--
ALTER TABLE `submission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submitted_by` (`submitted_by`),
  ADD KEY `subtask_id` (`subtask_id`);

--
-- Index pour la table `subtasks`
--
ALTER TABLE `subtasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `ai_suggestion`
--
ALTER TABLE `ai_suggestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `project`
--
ALTER TABLE `project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `submission`
--
ALTER TABLE `submission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `subtasks`
--
ALTER TABLE `subtasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `ai_suggestion`
--
ALTER TABLE `ai_suggestion`
  ADD CONSTRAINT `ai_suggestion_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`ID`);

--
-- Contraintes pour la table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `project_ibfk_1` FOREIGN KEY (`leader`) REFERENCES `user` (`ID`);

--
-- Contraintes pour la table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`ID`),
  ADD CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `user` (`ID`);

--
-- Contraintes pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submission` (`ID`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `user` (`ID`);

--
-- Contraintes pour la table `submission`
--
ALTER TABLE `submission`
  ADD CONSTRAINT `submission_ibfk_1` FOREIGN KEY (`submitted_by`) REFERENCES `user` (`ID`),
  ADD CONSTRAINT `submission_ibfk_2` FOREIGN KEY (`subtask_id`) REFERENCES `subtasks` (`ID`);

--
-- Contraintes pour la table `subtasks`
--
ALTER TABLE `subtasks`
  ADD CONSTRAINT `subtasks_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`ID`),
  ADD CONSTRAINT `subtasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `user` (`ID`);

--
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`ID`),
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `user` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
