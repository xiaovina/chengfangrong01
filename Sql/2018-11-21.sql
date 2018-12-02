CREATE TABLE `RealTimeDXDS` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `x` varchar(10) NOT NULL,
  `probability` decimal(4, 2) NOT NULL,
  `recordTime` varchar(50) NOT NULL DEFAULT '',
  `slice` int(11) unsigned NOT NULL,
  `createdAt` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6224 DEFAULT CHARSET=utf8;

CREATE TABLE `RealTime09` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `x` varchar(10) NOT NULL,
  `probability` decimal(4, 2) NOT NULL,
  `recordTime` varchar(50) NOT NULL DEFAULT '',
  `slice` int(11) unsigned NOT NULL,
  `createdAt` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6224 DEFAULT CHARSET=utf8;

CREATE TABLE `BettingConfig` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `frequencyId` varchar(200) NOT NULL,
  `config` JSON NOT NULL,
  `status` int(11) NOT NULL,
  `username` varchar(200) NOT NULL,
  `privateKey` varchar(200) NOT NULL,
  `isReal` int(1) NOT NULL,
  `createdAt` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6224 DEFAULT CHARSET=utf8;

CREATE TABLE `BettingLog` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `configId` int(11) NOT NULL,
  `frequencyId` varchar(200) NOT NULL,
  `config` json NOT NULL,
  `result` int(11) NOT NULL,
  `createdAt` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6226 DEFAULT CHARSET=utf8;
