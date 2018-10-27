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
