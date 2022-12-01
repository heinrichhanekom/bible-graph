# bible-graph
A graphQL schema to interact with a neo4j database containing the Bible.

## Start Up the Service
Install all the packages
```
node install
```

Start the apollo client
```
node index.js
```

## Import Data from CSV
[Neo4j Documentation](https://neo4j.com/developer/desktop-csv-import/)

In the csv for there is a file with the Public Domain - King James Version - of the Bible.
To import the bible use the following steps:

1. Copy the csv to in the Import folder in the neo4j directory.
2. Open the Neo4J terminal
3. Connect to the cypher shell
   `bin/cypher-shell``
4. Enter your credentials for the DB
5. Load the csv to see if it can be imported:

```
LOAD CSV WITH HEADERS FROM 'file:///kjv.csv' AS row 
WITH toInteger(row.Verse_ID) AS verse_id, 
row.Book_Name AS book, 
toInteger(row.Book_Number) as bookNumber,
toInteger(row.Chapter_ID) as chapter_id,
toInteger(row.Chapter) as chapter,
toInteger(row.Verse) as verse, 
row.Text as text
RETURN verse_id, book, bookNumber, chapter_id, chapter, verse, text LIMIT 3;
```

6. View and Add constraints

```
SHOW CONSTRAINTS;
```

Create constraint for Bible:
```
CREATE CONSTRAINT bible_name IF NOT EXISTS
FOR (x:Bible)
REQUIRE x.name IS UNIQUE;
```

Create constraint for Bible Id:
```
CREATE CONSTRAINT bible_id IF NOT EXISTS
FOR (x:Bible)
REQUIRE x.id IS UNIQUE;
```

Create constraint for Testement Name:
```
CREATE CONSTRAINT testament_name IF NOT EXISTS
FOR (x:Testament)
REQUIRE x.name IS UNIQUE;
```

Create constraint for Testement Id:
```
CREATE CONSTRAINT testament_id IF NOT EXISTS
FOR (x:Testament)
REQUIRE x.id IS UNIQUE;
```

Create constraint for Book Name:
```
CREATE CONSTRAINT book_name IF NOT EXISTS
FOR (x:Book)
REQUIRE x.name IS UNIQUE;
```

Create constraint for Book Id:
```
CREATE CONSTRAINT book_id IF NOT EXISTS
FOR (x:Book)
REQUIRE x.id IS UNIQUE;
```

Create constraint for Chapter Id:
```
CREATE CONSTRAINT chapter_id IF NOT EXISTS
FOR (x:Chapter)
REQUIRE x.id IS UNIQUE;
```

Create constraint for Verse Id:
```
CREATE CONSTRAINT verse_id IF NOT EXISTS
FOR (x:Verse)
REQUIRE x.id IS UNIQUE;
```

7. Import

````
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'file:///kjv.csv' AS row 
WITH toInteger(row.Verse_ID) AS verse_id, 
row.Book_Name AS book, 
toInteger(row.Book_Number) as bookNumber,
toInteger(row.Chapter_ID) as chapter_id,
toInteger(row.Chapter) as chapter,
toInteger(row.Verse) as verse, 
row.Text as text
MERGE (b:Book {id: bookNumber})
  ON CREATE SET b.name = book, b.bookNumber = bookNumber
MERGE (c:Chapter {id: chapter_id})
  ON CREATE SET c.number = chapter
MERGE (v:Verse {id: verse_id})
  ON CREATE SET v.number = verse, v.text = text
WITH b, c, v
MERGE (b)<-[ci:CHAPTER_IN]-(c)
MERGE (c)<-[vi:VERSE_IN]-(v)
RETURN count(v);
```

8. Add Bible and Testaments 
```
MERGE (b:Bible {id: 1})
  SET b.name = "King James Version", b.abbreviation = "KJV"
MERGE (t1:Testament {id: 1})
  SET t1.name = "Old Testament"
MERGE (t2:Testament {id: 2})
  SET t2.name = "New Testament"
MERGE (t1)-[:TESTAMENT_IN]->(b)
MERGE (t2)-[:TESTAMENT_IN]->(b)
```

9. Add Books To Testaments

Old Testament
```
MATCH (b:Book) 
WHERE b.bookNumber in range(1, 39)
MATCH (t:Testament {name: "Old Testament"})
MERGE (b)-[:BOOK_IN]->(t)
return b, t
```

New Testament
```
MATCH (b:Book) 
WHERE b.bookNumber in range(40, 66)
MATCH (t:Testament {name: "New Testament"})
MERGE (b)-[:BOOK_IN]->(t)
return b, t
```
