/* Script de base de datos*/
/* Comandos SQL para crear la base de datos del proyecto empleAdminis*/
/*

-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema empleadmin
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema empleadmin
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `empleadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish2_ci ;
USE `empleadmin` ;

-- -----------------------------------------------------
-- Table `empleadmin`.`EMPRESA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`EMPRESA` (
  `id_empresa` INT NOT NULL AUTO_INCREMENT,
  `nom_empresa` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_empresa`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`EMPLEADO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`EMPLEADO` (
  `id_cedula` INT NOT NULL,
  `tipo_documento` VARCHAR(45) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  `pais` VARCHAR(45) NOT NULL,
  `num_contacto` INT NOT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `direccion` VARCHAR(80) NOT NULL,
  `hora_inicio` TIME NULL,
  `hora_fin` TIME NULL,
  `primer_dias_laboral` ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo') NULL,
  `ultimo_dias_laboral` ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo') NULL,
  `cargo` VARCHAR(100) NOT NULL,
  `fotografia` VARCHAR(512) NOT NULL,
  `estatus_notificacion` VARCHAR(45) NOT NULL,
  `id_empresa_e` INT NOT NULL,
  PRIMARY KEY (`id_cedula`),
  INDEX `fk_EMPLEADO_EMPRESA_idx` (`id_empresa_e` ASC),
  CONSTRAINT `fk_EMPLEADO_EMPRESA`
    FOREIGN KEY (`id_empresa_e`)
    REFERENCES `empleadmin`.`EMPRESA` (`id_empresa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`cuenta_bancaria_empleado`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`cuenta_bancaria_empleado` (
  `num_cuenta_bancaria` INT NOT NULL,
  `nom_banco` VARCHAR(50) NOT NULL,
  `tipo_cuenta` VARCHAR(50) NOT NULL,
  `salario` FLOAT NOT NULL,
  `id_cedula_c` INT NOT NULL,
  PRIMARY KEY (`num_cuenta_bancaria`),
  INDEX `fk_cuenta_bancaria_empleado_EMPLEADO1_idx` (`id_cedula_c` ASC),
  CONSTRAINT `fk_cuenta_bancaria_empleado_EMPLEADO1`
    FOREIGN KEY (`id_cedula_c`)
    REFERENCES `empleadmin`.`EMPLEADO` (`id_cedula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`asistencia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`asistencia` (
  `id_registro_asistencia` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `horario` TIME NULL,
  `id_cedula_a` INT NOT NULL,
  PRIMARY KEY (`id_registro_asistencia`),
  INDEX `fk_asistencia_EMPLEADO1_idx` (`id_cedula_a` ASC),
  CONSTRAINT `fk_asistencia_EMPLEADO1`
    FOREIGN KEY (`id_cedula_a`)
    REFERENCES `empleadmin`.`EMPLEADO` (`id_cedula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`horas_extras`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`horas_extras` (
  `id_registro_horas_extras` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `horas_extras` INT NOT NULL,
  `total` INT NULL,
  `id_cedula_h` INT NOT NULL,
  PRIMARY KEY (`id_registro_horas_extras`),
  INDEX `fk_horas_extras_EMPLEADO1_idx` (`id_cedula_h` ASC),
  CONSTRAINT `fk_horas_extras_EMPLEADO1`
    FOREIGN KEY (`id_cedula_h`)
    REFERENCES `empleadmin`.`EMPLEADO` (`id_cedula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`incapacidad`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`incapacidad` (
  `Id_registro_incapacidad` INT NOT NULL AUTO_INCREMENT,
  `fecha_registro` DATE NOT NULL,
  `fecha_incapacidad` DATE NOT NULL,
  `causa` VARCHAR(1000) NULL,
  `descripcion` VARCHAR(2000) NULL,
  `archivo_incapacidad` VARCHAR(512) NOT NULL,
  `cantidad_dias_incapacidad` INT NULL,
  `id_cedula_i` INT NOT NULL,
  PRIMARY KEY (`Id_registro_incapacidad`),
  INDEX `fk_incapacidad_EMPLEADO1_idx` (`id_cedula_i` ASC),
  CONSTRAINT `fk_incapacidad_EMPLEADO1`
    FOREIGN KEY (`id_cedula_i`)
    REFERENCES `empleadmin`.`EMPLEADO` (`id_cedula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`user_perfil_empresa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`user_perfil_empresa` (
  `iduser_perfil_empresa` INT NOT NULL AUTO_INCREMENT,
  `correo` VARCHAR(45) NOT NULL,
  `password` VARCHAR(45) NOT NULL,
  `EMPRESA_id_empresa` INT NOT NULL,
  `status` VARCHAR(45) NOT NULL,
  `role` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`iduser_perfil_empresa`),
  INDEX `fk_user_perfil_empresa_EMPRESA1_idx` (`EMPRESA_id_empresa` ASC),
  CONSTRAINT `fk_user_perfil_empresa_EMPRESA1`
    FOREIGN KEY (`EMPRESA_id_empresa`)
    REFERENCES `empleadmin`.`EMPRESA` (`id_empresa`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`empleados_eliminados`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`empleados_eliminados` (
  `id_empleados_eliminados` INT NOT NULL,
  `motivo_eliminacion` VARCHAR(500) NOT NULL,
  `fechaEliminacion` DATE NOT NULL,
  `id_registro_elininar` INT NOT NULL AUTO_INCREMENT,
  `empresa_empleado` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_registro_elininar`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `empleadmin`.`inasistencia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `empleadmin`.`inasistencia` (
  `id_registro_asistencia` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `id_cedula_ina` INT NOT NULL,
  PRIMARY KEY (`id_registro_asistencia`),
  INDEX `fk_asistencia_EMPLEADO1_idx` (`id_cedula_ina` ASC),
  CONSTRAINT `fk_asistencia_EMPLEADO10`
    FOREIGN KEY (`id_cedula_ina`)
    REFERENCES `empleadmin`.`EMPLEADO` (`id_cedula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;



*/