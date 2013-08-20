module Todo {
	interface User {
		Name: string;
		Password: string;
	}

	interface Item {
		Title: string;
		Description: string;
		CompleteDue: Date;
	}

	export function Init() {
	}
}