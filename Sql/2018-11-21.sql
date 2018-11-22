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
