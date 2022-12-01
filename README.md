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

```
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

10. Add Devisions
```
MERGE (d1:Devision {id: 1})
  SET d1.name = "Law"
WITH d1
MATCH (b:Book) 
WHERE b.bookNumber in range(1, 5)
MERGE (b)-[:PART_OF]->(d1)
return b, d1

MERGE (d2:Devision {id: 2})
  SET d2.name = "History (OT)"
WITH d2
MATCH (b:Book) 
WHERE b.bookNumber in range(6, 17)
MERGE (b)-[:PART_OF]->(d2)
return b, d2

MERGE (d3:Devision {id: 3})
  SET d3.name = "Poetry"
WITH d3
MATCH (b:Book) 
WHERE b.bookNumber in range(18, 22)
MERGE (b)-[:PART_OF]->(d3)
return b, d3

MERGE (d4:Devision {id: 4})
  SET d4.name = "Major Prophets"
WITH d4
MATCH (b:Book) 
WHERE b.bookNumber in range(23, 27)
MERGE (b)-[:PART_OF]->(d4)
return b, d4

MERGE (d5:Devision {id: 5})
  SET d5.name = "Minor Prophets"
WITH d5
MATCH (b:Book) 
WHERE b.bookNumber in range(28, 39)
MERGE (b)-[:PART_OF]->(d5)
return b, d5

MERGE (d6:Devision {id: 6})
  SET d6.name = "Gospels"
WITH d6
MATCH (b:Book) 
WHERE b.bookNumber in range(40, 43)
MERGE (b)-[:PART_OF]->(d6)
return b, d6

MERGE (d7:Devision {id: 7})
  SET d7.name = "History (NT)"
WITH d7
MATCH (b:Book) 
WHERE b.bookNumber in range(44, 44)
MERGE (b)-[:PART_OF]->(d7)
return b, d7

MERGE (d8:Devision {id: 8})
  SET d8.name = "Letters"
WITH d8
MATCH (b:Book) 
WHERE b.bookNumber in range(45, 65)
MERGE (b)-[:PART_OF]->(d8)
return b, d8

MERGE (d9:Devision {id: 9})
  SET d9.name = "Prophecy"
WITH d9
MATCH (b:Book) 
WHERE b.bookNumber in range(66, 66)
MERGE (b)-[:PART_OF]->(d9)
return b, d9
```