/*
 * Upon submission, this file should contain the SQL script to initialize your database.
 * It should contain all DROP TABLE and CREATE TABLE statments, and any INSERT statements
 * required.
 */
drop table if exists test;

create table test (
    id integer not null primary key,
    stuff text  
);

insert into test (stuff) values
    ('Things'),
    ('More things');

/*
*philanthropic-polar-bears sql starts here
*/
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS image;
DROP TABLE IF EXISTS user_article;
DROP TABLE IF EXISTS article;
DROP TABLE IF EXISTS user_theme;
DROP TABLE IF EXISTS theme;
DROP TABLE IF EXISTS user_blog;
DROP TABLE IF EXISTS blog;
DROP TABLE IF EXISTS user;

CREATE TABLE IF NOT EXISTS user(
	id INTEGER NOT NULL,
    username varchar(64) UNIQUE NOT NULL,
    password varchar(64) NOT NULL,
    name varchar(64),
    authToken varchar(128),
	video varchar(128),
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS blog(
	id INTEGER NOT NULL,
	creator INTEGER NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(creator) REFERENCES user(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_blog(
	userId INTEGER NOT NULL,
	blogId INTEGER NOT NULL,
	PRIMARY KEY(userId, blogId),
	FOREIGN KEY(userId) REFERENCES user(id) on DELETE CASCADE,
	FOREIGN KEY(blogId) REFERENCES blog(id) on DELETE CASCADE
);

--theme: code table
CREATE TABLE IF NOT EXISTS theme(
	id INTEGER NOT NULL,
	name varchar(24) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS user_theme(
	userId INTEGER NOT NULL,
	themeId INTEGER NOT NULL,
	PRIMARY KEY(userId, themeId),
	FOREIGN KEY(userId) REFERENCES user(id) on DELETE CASCADE,
	FOREIGN KEY(themeId) REFERENCES theme(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS article(
	id INTEGER NOT NULL,
	title varchar(128) NOT NULL,
	content TEXT  NOT NULL,
	time timestamp NOT NULL,
	blogId INTEGER NOT NULL,
	themeId INTEGER NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(blogId) REFERENCES blog(id) on DELETE CASCADE,
	FOREIGN KEY(themeId) REFERENCES theme(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_article(
	userId INTEGER NOT NULL,
	articleId INTEGER NOT NULL,
	PRIMARY KEY(userId, articleId),
	FOREIGN KEY(userId) REFERENCES user(id) on DELETE CASCADE,
	FOREIGN KEY(articleId) REFERENCES article(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS image(
	id INTEGER NOT NULL,
	path TEXT NOT NULL,
	articleId INTEGER NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(articleId) REFERENCES article(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment(
	id INTEGER NOT NULL,
	content TEXT NOT NULL,
	time timestamp NOT NULL,
	articleId INTEGER NOT NULL,
	commentId INTEGER ,
	like INTEGER DEFAULT 0 NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(articleId) REFERENCES article(id) on DELETE CASCADE,
	FOREIGN KEY(commentId) REFERENCES comment(id) on DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message(
	id INTEGER NOT NULL,
	senderId INTEGER NOT NULL,
	receiverId INTEGER NOT NULL,
	content TEXT NOT NULL,
	time timestamp NOT null,
	PRIMARY KEY(id),
	FOREIGN KEY(senderId) REFERENCES user(id) on DELETE CASCADE,
	FOREIGN KEY(receiverId) REFERENCES user(id) on DELETE CASCADE
	
);

INSERT INTO theme (name) VALUES
('Music'),
('Movie'),
('Dog'),
('Cat'),
('Fashion'),
('Beauty');
