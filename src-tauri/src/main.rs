// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, Result as SqlResult};
use tauri::command;
use tauri::api::path::desktop_dir;
use std::path::PathBuf;
use serde::Serialize;

#[derive(Debug, serde::Serialize)]
struct Snippet {
    id: i32,
    name: String,
    code: Option<String>, // Usar Option para manejar posibles valores nulos en la base de datos
}

#[derive(Debug, Serialize)]
struct Patient {
    id: i32,
    name: String,
    age: i32,
}

fn get_db_path() -> Result<PathBuf, String> {
    let desktop_path = desktop_dir().ok_or("Failed to get desktop directory")?;
    let db_path = desktop_path.join("tauri").join("my_database.db");
    
    println!("Database path: {:?}", db_path);

    Ok(db_path)
}

fn init_db() -> SqlResult<()> {
    
    let db_path = get_db_path().unwrap();
    let conn: Connection = Connection::open(db_path)?;

    // Crea una tabla de ejemplo
    conn.execute(
        "CREATE TABLE IF NOT EXISTS snippets (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER
        )",
        [],
    )?;

    println!("Database initialized successfully.");
    Ok(())
}

#[command]
fn insert_user(name: &str, code: &str) -> Result<(), String> {
    println!("Attempting to insert user: name = {}, code = {}", name, code);

    let db_path = get_db_path().unwrap();

    // Manejo del error con un tipo de retorno compatible con Tauri
    let conn = Connection::open(db_path).map_err(|e| {
        let err_msg = format!("Failed to open the database: {}", e);
        eprintln!("{}", err_msg);
        err_msg
    })?;

    conn.execute(
        "INSERT INTO snippets (name, code) VALUES (?1, ?2)",
        params![name, code],
    )
    .map_err(|e| {
        let err_msg = format!("Failed to execute the insert statement: {}", e);
        eprintln!("{}", err_msg);
        err_msg
    })?;

    println!("User inserted successfully.");
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_snippets() -> Result<Vec<Snippet>, String> {

    let db_path = get_db_path().unwrap();

    // Abre la conexión a la base de datos
    let conn = Connection::open(db_path).map_err(|e| {
        let err_msg = format!("Failed to open the database: {}", e);
        eprintln!("{}", err_msg);
        err_msg
    })?;

    // Define la consulta SQL
    let query = "SELECT id, name, code FROM snippets";
    
    // Prepara la consulta
    let mut stmt = conn.prepare(query).map_err(|e| {
        let err_msg = format!("Failed to prepare the query: {}", e);
        eprintln!("{}", err_msg);
        err_msg
    })?;

    // Ejecuta la consulta y mapea los resultados a un vector de `Snippet`
    let snippet_iter = stmt
        .query_map([], |row| {
            Ok(Snippet {
                id: row.get(0)?,
                name: row.get(1)?,
                code: row.get(2)?, // Ajustado para manejar valores `NULL` en la base de datos
            })
        })
        .map_err(|e| {
            let err_msg = format!("Failed to execute the query: {}", e);
            eprintln!("{}", err_msg);
            err_msg
        })?;

    // Recoge los resultados
    let mut snippets = Vec::new();
    for snippet in snippet_iter {
        match snippet {
            Ok(snippet) => snippets.push(snippet),
            Err(e) => eprintln!("Error retrieving snippet: {}", e),
        }
    }

    Ok(snippets)
}

#[tauri::command]
fn get_v2() -> Result<Vec<Snippet>, String> {
    let conn = Connection::open("my_database.db").expect("Error en la conexión a la base de datos");

    let mut _statement = conn.prepare("SELECT id, name, code FROM snippets").expect("Error en la preparación de la consulta");

    let iterador_snippets = _statement.query_map([], |row| {
        Ok(Snippet {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
        })
    }).expect("Error en la ejecución de la consulta");

    let mut snippets = Vec::new();
    for snippet in iterador_snippets {
        match snippet {
            Ok(snippet) => snippets.push(snippet),
            Err(e) => eprintln!("Error recuperando el snippet: {}", e),
        }
    }

    Ok(snippets)
}

#[tauri::command]
fn get_patient(id: i32) -> Result<Patient, String> {

    let db_path = get_db_path().unwrap();
    let conn: Connection = Connection::open(db_path).expect("Error en la preparación de la consulta");
   
    let patient = conn.query_row(
        "SELECT id, name, age FROM patients WHERE id = ?1",
        params![id],
        |row| {
            Ok(Patient {
                id: row.get(0)?,
                name: row.get(1)?,
                age: row.get(2)?,
            })
        },
    ).map_err(|e| e.to_string())?;

    Ok(patient)
}

fn main() {
    if let Err(e) = init_db() {
        eprintln!("Error initializing database: {}", e);
    }

    get_patient(1);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, insert_user, get_snippets, get_v2, get_patient])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}