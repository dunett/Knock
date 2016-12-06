CREATE TABLE `User` (
  `u_id` int(11) NOT NULL,
  `email` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `alias` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `area` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `thumbnail` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `profile` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `job` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `fit` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `faith` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hobby` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `money` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `c_id` int(11) DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `cookie` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `age_min` int(11) DEFAULT NULL,
  `age_max` int(11) DEFAULT NULL,
  `school` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`u_id`),
  KEY `u-c_idx` (`c_id`),
  CONSTRAINT `u-c` FOREIGN KEY (`c_id`) REFERENCES `Characters` (`c_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Report` (
  `r_id` int(11) NOT NULL,
  `sender` int(11) DEFAULT NULL,
  `message` text COLLATE utf8_unicode_ci,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  KEY `Report_FK` (`r_id`),
  CONSTRAINT `Report_FK` FOREIGN KEY (`r_id`) REFERENCES `Relation` (`r_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Relation` (
  `r_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender` int(11) NOT NULL,
  `favor_s` tinyint(4) DEFAULT '0',
  `receiver` int(11) NOT NULL,
  `favor_r` tinyint(4) DEFAULT '0',
  `relation` tinyint(4) DEFAULT '0',
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`r_id`),
  KEY `RELATION_FK1` (`sender`),
  KEY `RELATION_FK2` (`receiver`),
  CONSTRAINT `RELATION_FK1` FOREIGN KEY (`sender`) REFERENCES `Characters` (`c_id`),
  CONSTRAINT `RELATION_FK2` FOREIGN KEY (`receiver`) REFERENCES `Characters` (`c_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Quiz` (
  `q_id` int(11) NOT NULL AUTO_INCREMENT,
  `question1` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `question2` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `answer1` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `answer2` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `question_img` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `answer1_img` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `answer2_img` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`q_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Other` (
  `c_id` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `similar` int(11) NOT NULL,
  KEY `type_idx` (`c_id`),
  CONSTRAINT `type` FOREIGN KEY (`c_id`) REFERENCES `Characters` (`c_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Notice` (
  `n_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL,
  `contents` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`n_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Inspect` (
  `I_id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `answer1` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `answer2` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `value1` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `value2` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`I_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `History` (
  `u_id` int(11) DEFAULT NULL,
  `cost` int(11) DEFAULT NULL,
  `rest` int(11) DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `description` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  KEY `History_FK_idx` (`u_id`),
  CONSTRAINT `History_FK` FOREIGN KEY (`u_id`) REFERENCES `User` (`u_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Feature` (
  `c_id` int(11) NOT NULL,
  `f_type` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  KEY `Feature_FK` (`c_id`),
  CONSTRAINT `Feature_FK` FOREIGN KEY (`c_id`) REFERENCES `Characters` (`c_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Destiny` (
  `d_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender` int(11) NOT NULL,
  `receiver` int(11) NOT NULL,
  `type` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`d_id`),
  KEY `to_idx` (`receiver`),
  KEY `from` (`sender`),
  CONSTRAINT `from` FOREIGN KEY (`sender`) REFERENCES `User` (`u_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `to` FOREIGN KEY (`receiver`) REFERENCES `User` (`u_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=380 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Characters` (
  `c_id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `image` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `explain` text CHARACTER SET ucs2 COLLATE ucs2_unicode_ci,
  PRIMARY KEY (`c_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Board` (
  `b_id` int(11) NOT NULL AUTO_INCREMENT,
  `writer` int(11) NOT NULL,
  `question` text CHARACTER SET utf8 NOT NULL,
  `answer` text COLLATE utf8_unicode_ci,
  `q_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `a_date` datetime DEFAULT NULL,
  PRIMARY KEY (`b_id`),
  KEY `userFK_idx` (`writer`),
  CONSTRAINT `userFK` FOREIGN KEY (`writer`) REFERENCES `User` (`u_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `Answer` (
  `a_id` int(11) NOT NULL AUTO_INCREMENT,
  `u_id` int(11) NOT NULL,
  `q_id` int(11) DEFAULT NULL,
  `answer` int(11) DEFAULT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`a_id`),
  KEY `u_id` (`u_id`),
  KEY `q_id` (`q_id`),
  CONSTRAINT `Answer_ibfk_1` FOREIGN KEY (`q_id`) REFERENCES `Quiz` (`q_id`),
  CONSTRAINT `u_id` FOREIGN KEY (`u_id`) REFERENCES `User` (`u_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

