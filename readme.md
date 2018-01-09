## Install

```
docker-compose run --rm app npm install
```

## Update your .env
```
cp .env.example .env
```


## Extract data

Extracted data in storage/parsed folder

```
docker-compose run --rm app node index
```