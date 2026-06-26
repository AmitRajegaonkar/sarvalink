show databases;
use studentinfo;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sr_no VARCHAR(255),
    name VARCHAR(255),
    em3_th INT,
    em3_pr INT,
    dsgt_th INT,
    dsgt_pr INT,
    ds_th INT,
    ds_pr INT,
    dlcoa_th INT,
    dlcoa_pr INT,
    cg_th INT,
    cg_pr INT,
    total_th INT,
    total_pr INT,
    grand_total INT,
    percentage DECIMAL(5,2)
);


INSERT INTO students (
    sr_no,
    name,
    em3_th,
    em3_pr,
    dsgt_th,
    dsgt_pr,
    ds_th,
    ds_pr,
    dlcoa_th,
    dlcoa_pr,
    cg_th,
    cg_pr,
    total_th,
    total_pr,
    grand_total,
    percentage
) VALUES (
    'A-5',            -- sr_no
    'Bhumika',         -- name
    10,               -- em3_th
    5,                -- em3_pr
    8,                -- dsgt_th
    4,                -- dsgt_pr
    12,               -- ds_th
    6,                -- ds_pr
    14,               -- dlcoa_th
    7,                -- dlcoa_pr
    11,               -- cg_th
    5,                -- cg_pr
    33,               -- total_th
    15,               -- total_pr
    48,               -- grand_total
    85.2              -- percentage (as a decimal)
);

SELECT * FROM students ;