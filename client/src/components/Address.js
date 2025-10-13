import React, { memo, useEffect, useState } from "react";
// Import các component dùng để chọn và hiển thị địa chỉ
import { Select, InputReadOnly } from "../components";
// Import các hàm gọi API để lấy danh sách tỉnh/thành và quận/huyện
import { apiGetPublicProvinces, apiGetPublicDistrict } from "../services";

// Component Address nhận props từ cha để cập nhật dữ liệu và xử lý lỗi
const Address = ({ setPayload, invalidFields, setInvalidFields }) => {
  // Khai báo state để lưu danh sách tỉnh/thành và quận/huyện
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  // State lưu ID của tỉnh và quận được chọn
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");

  // State để reset quận khi tỉnh thay đổi
  const [reset, setReset] = useState(false);

  // useEffect đầu tiên: gọi API lấy danh sách tỉnh/thành khi component mount
  useEffect(() => {
    const fetchPublicProvince = async () => {
      const response = await apiGetPublicProvinces();
      if (response.status === 200) {
        setProvinces(response?.data.results); // Cập nhật danh sách tỉnh/thành
      }
    };
    fetchPublicProvince();
  }, []);

  // useEffect thứ hai: gọi API lấy danh sách quận/huyện khi tỉnh thay đổi
  useEffect(() => {
    setDistrict(""); // Reset quận đã chọn
    const fetchPublicDistrict = async () => {
      const response = await apiGetPublicDistrict(province);
      if (response.status === 200) {
        setDistricts(response.data?.results); // Cập nhật danh sách quận/huyện
      }
    };

    // Nếu có tỉnh được chọn thì gọi API, ngược lại thì reset danh sách quận
    province && fetchPublicDistrict();
    !province ? setReset(true) : setReset(false);
    !province && setDistricts([]);
  }, [province]);

  // useEffect thứ ba: cập nhật dữ liệu địa chỉ vào payload khi tỉnh hoặc quận thay đổi
  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      // Tạo chuỗi địa chỉ từ tên quận và tỉnh
      address: `${
        district
          ? `${
              districts?.find((item) => item.district_id === district)
                ?.district_name
            }, `
          : ""
      }${
        province
          ? provinces?.find((item) => item.province_id === province)
              ?.province_name
          : ""
      }`,
      // Lưu tên tỉnh riêng để dùng cho các mục khác nếu cần
      province: province
        ? provinces?.find((item) => item.province_id === province)
            ?.province_name
        : "",
    }));
  }, [province, district]);

  // JSX hiển thị giao diện chọn địa chỉ
  return (
    <div>
      <h2 className="font-semibold text-xl py-4">Địa chỉ cho thuê</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Component chọn tỉnh/thành */}
          <Select
            setInvalidFields={setInvalidFields}
            invalidFields={invalidFields}
            type="province"
            value={province}
            setValue={setProvince}
            options={provinces}
            label="Tỉnh/Thành phố"
          />
          {/* Component chọn quận/huyện */}
          <Select
            setInvalidFields={setInvalidFields}
            invalidFields={invalidFields}
            reset={reset}
            type="district"
            value={district}
            setValue={setDistrict}
            options={districts}
            label="Quận/Huyện"
          />
        </div>

        {/* Hiển thị địa chỉ chính xác đã chọn */}
        <InputReadOnly
          label="Địa chỉ chính xác"
          value={`${
            district
              ? `${
                  districts?.find((item) => item.district_id === district)
                    ?.district_name
                },`
              : ""
          } ${
            province
              ? provinces?.find((item) => item.province_id === province)
                  ?.province_name
              : ""
          }`}
        />
      </div>
    </div>
  );
};

// Dùng memo để tránh render lại không cần thiết
export default memo(Address);
