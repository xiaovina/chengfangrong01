CREATE TABLE `SocketData` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `type` int(11) DEFAULT NULL,
  `blocknum` varchar(50) DEFAULT NULL,
  `time` varchar(50) DEFAULT NULL,
  `dataId` varchar(500) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=325 DEFAULT CHARSET=utf8;

CREATE TABLE `LotteryRecord` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `gameid` int(11) NOT NULL,
  `result` int(11) NOT NULL,
  `daxiao` varchar(10) NOT NULL DEFAULT '',
  `danshuang` varchar(10) NOT NULL DEFAULT '',
  `recordTime` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=649 DEFAULT CHARSET=utf8;
