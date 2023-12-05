import { AppstoreOutlined, FundViewOutlined, MailOutlined, TableOutlined } from "@ant-design/icons";
import { Menu, MenuProps } from "antd";
import { useState } from "react";

const items: MenuProps["items"] = [
	{
		label: "视图模式",
		key: "view",
		icon: <FundViewOutlined />,
	},
	{
		label: "数据集模式",
		key: "dataset",
		icon: <TableOutlined />,
	},
];

export default function Navigation({ onNaviChange }: { onNaviChange: Function }) {
	const [current, setCurrent] = useState("view");

	const onClick: MenuProps["onClick"] = e => {
		setCurrent(e.key);
		onNaviChange(e.key);
	};

	return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
}
