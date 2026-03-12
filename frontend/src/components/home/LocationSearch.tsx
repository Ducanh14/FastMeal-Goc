"use client";

import { MapPin, Phone, Clock, ChevronDown, Store, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchActiveBranches, BranchData } from "@/lib/api";

export default function LocationSearch() {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function loadBranches() {
      try {
        const data = await fetchActiveBranches();
        setBranches(data);
      } catch (error) {
        console.error("Error loading branches:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBranches();
  }, []);

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchText.toLowerCase()) ||
      b.address.toLowerCase().includes(searchText.toLowerCase()) ||
      b.district.toLowerCase().includes(searchText.toLowerCase()) ||
      b.city.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (branch: BranchData) => {
    setSelectedBranch(branch);
    setShowDropdown(false);
    setSearchText("");
  };

  return (
    <section id="locations" className="bg-[#1a2332] py-8 sm:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-center mb-5 sm:mb-6">
          <span className="text-white">TÌM CHI NHÁNH </span>
          <span className="text-[#FF6B35]">FASTMEAL</span>
        </h2>

        <div className="bg-[#243447] rounded-xl p-4 sm:p-5 lg:p-6 border border-[#243447]">
          {/* Branch selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between bg-[#1a2332] border border-[#344a60] rounded-lg py-3 px-4 text-sm text-white hover:border-[#FF6B35] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Store size={16} className="text-[#FF6B35]" />
                <span className={selectedBranch ? "text-white" : "text-gray-500"}>
                  {selectedBranch ? selectedBranch.name : "Chọn chi nhánh gần bạn"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a2332] border border-[#344a60] rounded-lg shadow-2xl z-20 max-h-72 overflow-hidden flex flex-col">
                {/* Search input */}
                <div className="p-2 border-b border-[#243447]">
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Tìm theo tên, địa chỉ, quận..."
                      autoFocus
                      className="w-full bg-[#243447] border border-[#344a60] rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                    />
                  </div>
                </div>

                {/* Branch list */}
                <div className="overflow-y-auto flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredBranches.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      {branches.length === 0
                        ? "Chưa có chi nhánh nào"
                        : "Không tìm thấy chi nhánh phù hợp"}
                    </div>
                  ) : (
                    filteredBranches.map((branch) => {
                      const isSelected = selectedBranch?._id === branch._id;
                      return (
                        <button
                          key={branch._id}
                          onClick={() => handleSelect(branch)}
                          className={`w-full text-left px-4 py-3 hover:bg-[#243447] transition-colors border-b border-[#243447]/50 last:border-0 ${
                            isSelected ? "bg-[#243447]" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {branch.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {branch.address}
                                {(branch.district || branch.city) &&
                                  ` · ${[branch.district, branch.city].filter(Boolean).join(", ")}`}
                              </p>
                            </div>
                            {isSelected && (
                              <Check size={16} className="text-[#FF6B35] shrink-0 mt-0.5" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selected branch info */}
          {selectedBranch && (
            <div className="mt-4 bg-[#1a2332] rounded-lg p-4 border border-[#344a60] space-y-2.5">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-[#FF6B35]" />
                <h3 className="text-white font-bold">{selectedBranch.name}</h3>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin size={14} className="text-[#FF6B35] shrink-0 mt-0.5" />
                <span>
                  {selectedBranch.address}
                  {(selectedBranch.district || selectedBranch.city) &&
                    `, ${[selectedBranch.district, selectedBranch.city].filter(Boolean).join(", ")}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Phone size={14} className="text-[#FF6B35]" />
                  <span>{selectedBranch.phone}</span>
                </div>
                {selectedBranch.openingHours && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Clock size={14} className="text-[#FF6B35]" />
                    <span>{selectedBranch.openingHours}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close dropdown on outside click */}
          {showDropdown && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setShowDropdown(false);
                setSearchText("");
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
