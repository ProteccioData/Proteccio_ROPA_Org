import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import axiosInstance from "../../utils/axiosInstance";

export default function UserSearchSelect({ value, onChange }) {
  const loadOptions = async (inputValue) => {
    try {
      const res = await axiosInstance.get("/users", {
        params: { search: inputValue, limit: 10 }
      });

      return res.data.users.map((user) => ({
        label: `${user.full_name} (${user.email})`,
        value: user.id,
      }));
    } catch (err) {
      console.error("User search failed:", err);
      return [];
    }
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      value={value ? { label: value.label, value: value.value } : null}
      onChange={onChange}
      placeholder="Search users..."
      className="text-black"
      styles={{
        control: (base) => ({ ...base, borderColor: "#828282", boxShadow: "none" }),
        menu: (base) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
}
