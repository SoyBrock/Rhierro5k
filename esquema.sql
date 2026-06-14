create database tienda;

create table productos(
    id integer not null auto_increment,
    nombre varchar(255),
    precio decimal(10, 2),
    primary key(id)
);


create table clientes(
    id integer not null auto_increment,
    cedula varchar(10) not null,
    nombre varchar(255) not null,
    apellido varchar(255) not null,
    direccion varchar(255) not null,
    telefono varchar(20) not null,
    primary key(id)
);

create table usuarios(
    id integer not null auto_increment,
    nombre varchar(60) not null,
    apellido varchar(60) not null,
    email varchar(60) not null,
    login varchar(60) not null,
    password varchar(60) not null,
    primary key(id)
);



