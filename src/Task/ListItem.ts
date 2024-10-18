import { TaskRegularExpressions } from './TaskRegularExpressions';

export class ListItem {
    /** The original line read from file.
     *
     * Will be empty if Task was created programmatically
     * (for example, by Create or Edit Task, or in tests, including via {@link TaskBuilder}). */
    public readonly originalMarkdown: string;

    public readonly parent: ListItem | null = null;
    public readonly children: ListItem[] = [];
    public readonly description: string;

    constructor(originalMarkdown: string, parent: ListItem | null) {
        this.description = originalMarkdown.replace(TaskRegularExpressions.listItemRegex, '').trim();
        this.originalMarkdown = originalMarkdown;
        this.parent = parent;

        if (parent !== null) {
            parent.children.push(this);
        }
    }

    /**
     * Return the top-level parent of this list item or task,
     * which will not be indented.
     *
     * The root of an unintended item is itself.
     *
     * This is useful because the Tasks plugin currently only stores a flat list of {@link Task} objects,
     * and does not provide direct access to all the parsed {@link ListItem} objects.
     *
     * @see isRoot
     */
    get root(): ListItem {
        if (this.parent === null) {
            return this;
        }

        return this.parent.root;
    }

    /**
     * Returns whether this is a top-level (unindented) list item or task.
     *
     * @see root
     */
    get isRoot(): boolean {
        return this.parent === null;
    }

    identicalTo(other: ListItem) {
        if (this.constructor.name !== other.constructor.name) {
            return false;
        }

        if (this.originalMarkdown !== other.originalMarkdown) {
            return false;
        }

        if (!ListItem.listsAreIdentical(this.children, other.children)) {
            return false;
        }

        return true;
    }

    /**
     * Compare two lists of ListItem objects, and report whether their
     * tasks are identical in the same order.
     *
     * This can be useful for optimising code if it is guaranteed that
     * there are no possible differences in the tasks in a file
     * after an edit, for example.
     *
     * If any field is different in any task, it will return false.
     *
     * @param list1
     * @param list2
     */
    static listsAreIdentical(list1: ListItem[], list2: ListItem[]) {
        if (list1.length !== list2.length) {
            return false;
        }

        return list1.every((item, index) => item.identicalTo(list2[index]));
    }
}
