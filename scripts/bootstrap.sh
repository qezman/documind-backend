#!/bin/bash
service postgresql start
sleep 2
su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
su - postgres -c "psql -c \"CREATE DATABASE fintrack;\""
su - postgres -c "psql -d fintrack -c \"CREATE EXTENSION IF NOT EXISTS vector;\""
echo "done"
