import React, { useState } from "react";
import {
  Button,
  Input,
  Label,
  Title2,
  Card,
  Text,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableBody,
  TableCell,
  Tooltip,
  Caption1,
} from "@fluentui/react-components";
import { Info16Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/Home.css";
import "../styles/pages/UsersList.css";

export default function Home() {
  const nav = useNavigate();
  const { profile } = useAuth();

  const [email, setEmail] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const findByEmail = async (e) => {
    e.preventDefault();
    setErr("");
    setRows([]);
    setLoading(true);
    try {
      if (email === "") {
        setErr(`No user with email: "${email}" is found.`);
        setRows([]);
      } else {
        const { data } = await api(`/ems/users/by-email?email=${encodeURIComponent(email)}`);
        setRows([data]);
      }
    } catch (e2) {
      setErr(e2?.message || "User not found");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-shell">
      <Title2>Welcome</Title2>

      <div className="home-actions">
        <Button
          appearance="primary"
          className="action-btn action-primary"
          onClick={() => (profile?.role === "ADMIN" ? nav("/ems/users") : nav("/no-access"))}
        >
          Manage Users
        </Button>
        <Button
          className="action-btn action-ghost"
          onClick={() => (profile?.role === "ADMIN" ? nav("/ems/users/create") : nav("/no-access"))}
        >
          Create User
        </Button>
      </div>

      <Card className="home-card">
        <form className="find-form" onSubmit={findByEmail}>
          <Label htmlFor="email">Find user by email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e, d) => setEmail(d.value)}
            placeholder="name@example.com"
            size="large"
          />
          <Button type="submit" appearance="primary" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>

        {err && (
          <Text style={{ color: "crimson", fontSize: "large", fontFamily: "Cascadia Mono" }}>
            {err}
          </Text>
        )}

        <div className="home-results">
          <div className="full-width-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell style={{ width: "72px" }}>ID</TableHeaderCell>
                  <TableHeaderCell style={{ width: "40%" }}>Email</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.userID} className="row--card">
                    <TableCell className="mono" style={{ textAlign: "left" }}>{u.userID}</TableCell>
                    <TableCell className="mono cell-email">{u.email}</TableCell>
                    <TableCell className="cell-name">{u.firstName} {u.lastName}</TableCell>
                    <TableCell><span className="pill pill-role">{u.userRole}</span></TableCell>
                    <TableCell>
                      <span className={`pill ${u.userStatus === "ACTIVE" ? "pill-ok" : "pill-warn"}`}>
                        {u.userStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="users-table-actions">
                        <Tooltip content="Details">
                          <Button
                            size="small"
                            appearance="secondary"
                            className="details-btn"
                            icon={<Info16Regular />}
                            onClick={() => nav(`/ems/users/${u.userID}`)}
                          >
                            Details
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Caption1 className="results-caption">
            {rows.length === 0 ? "No results" : `${rows.length} result`}
          </Caption1>
        </div>
      </Card>
    </div>
  );
}
