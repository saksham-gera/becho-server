import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 24009,
  database: "defaultdb",
  ssl: {
      rejectUnauthorized: true,
      ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUXsH2s/ZqVABKpOphQdYpUQrFWrkwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvY2MxODQzYmUtOWUxNi00NzIzLWJhOWYtMjEwNTNhNGI3
YjAwIFByb2plY3QgQ0EwHhcNMjUwMTAzMDczODEyWhcNMzUwMTAxMDczODEyWjA6
MTgwNgYDVQQDDC9jYzE4NDNiZS05ZTE2LTQ3MjMtYmE5Zi0yMTA1M2E0YjdiMDAg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMlH1qvU
oIwEyJnv8x2iSrfvAYq7MNSoI5e60UkUKzexF/6gi71rY0X0iX2dndE8vxySDjTw
ZQRlwV8G6aPsyYBr3mGqx5/SE/42Px+DqZ9fhqCHVsNNpa7VVm0z4KMnHyxR2yF7
XgtgYkAeFe0jX/cdkiOZE0cYk+ZWgZGcevMKobfT9VYGjW20dehY5ryZmav7aWCZ
hcNDgCw6c5ZMhGLRP1Imgck01w701olGsjuEsjJaijH2PHkr30Q2REOg1o0m8RZb
UghK2l1h5S5EghmX46vPfklO/YC5fmC0sh+vruixDRA9EiVoufbCS3ILWFIPMKGZ
pUGH02FP6B+a63Kbolrq1LxCLW+jXaxTe+Otzqh6L1pheZUf88oHb5YmYFAG232c
PdFeNfVfPPjKUEuYwBOekdupmOuvOoRTpxACpm9dcsOS5WhQ5waRqVe7oAYcdAHI
vEkwE7W4hjipDjgHdbDwOCmUHgGoZ8ifasg1eekRuQXPUNGUOl12YUsIQQIDAQAB
oz8wPTAdBgNVHQ4EFgQUfmQAYmaAVbd22c8GncsQ7UFFt6gwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAKUTCC9IM7JqK/Ii
IXLBkSmQrYB/lJofDWfJpmX8jf9AAKOIDAhyCCCA01sqeoqCWUmpuZFHSzhTjC59
wXhWlvqjG+bltCJkhxDSIiqX5n2ruGQMluB2RjjfT6iJUa8FSimV/MBC+uCigEH7
xuqbLSfY2XHgeik9qThNj9g7vqjZFAqwAXfgya9EGblgGbk6+DDlTJn0n90jJan4
+Y64Qsc6SlLE6QKkOLFYWye51z8XoAx6Tz03zqkFxrCsO5WWr4Va5Sy985iXLKXv
2/cpyEQGkUdh3fa91tqeTPWhxcuRCpdUboQIwyiB79s+AjPJklziuSwvzZnGLYYz
OSLKQnKf9m9a3HSp4stfUEa4Kifp952SL82KCRjufadGVg2FnTJ+PdQE1Ju9p2vv
c8Oe7i5lBTnUQNdvJu1pExpIs+Emm+UY7WBh9e7aY4fKIXNyopp30N4gSZebo9VW
e2wj7LqcSVYJSgH/Cc59UytUb8na2aVi/11k0unnbr3+VGgwvA==
-----END CERTIFICATE-----`,
  },
});

pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Database error:", err.message);
});

export default pool;