import { AppstoreOutlined, FundViewOutlined, MailOutlined, TableOutlined } from "@ant-design/icons";
import { Menu, MenuProps } from "antd";
import { useState } from "react";

export const naviItems: any = [
	{
		label: "3D 模式",
		key: "three",
		icon: <FundViewOutlined />,
	},
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

export default function Navigation({ onNaviChange, current }: { onNaviChange: Function; current: string }) {
	const onClick: MenuProps["onClick"] = e => {
		onNaviChange(e.key);
	};

	return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={naviItems} />;
}
