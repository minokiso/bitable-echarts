import { AppstoreOutlined, FundViewOutlined, HeatMapOutlined, MailOutlined, QuestionCircleOutlined, TableOutlined } from "@ant-design/icons";
import { Menu, MenuProps } from "antd";

export const naviItems: any = [
	{
		label: "3D 模式",
		key: "three",
		icon: <FundViewOutlined />,
	},
	{
		label: "2D 模式",
		key: "view",
		icon: <FundViewOutlined />,
	},
	{
		label: "热力图模式",
		key: "heat",
		icon: <HeatMapOutlined />,
	},
];

export default function Navigation({ onNaviChange, current }: { onNaviChange: Function; current: string }) {
	const onClick: MenuProps["onClick"] = e => {
		onNaviChange(e.key);
	};

	return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={naviItems} />;
}
