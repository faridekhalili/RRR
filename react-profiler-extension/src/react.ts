(function()
{
const MOUNTED_COLOR: [number, number, number] = [69, 219, 53]
const UPDATE_COLOR: [number, number, number] = [255, 61, 61]

enum UpdateState { NONE, RERENDER, MOUNTED }
class ReactNode
{

    public readonly name: string | null = null
    public readonly key: string | number

    public readonly children: ReactNode[] = []

    private readonly user: boolean

    private readonly state: any
    private readonly props: any


    public constructor(private readonly node: any, public readonly parent: ReactNode | null)
    {
        // FunctionComponent = 0
        // ClassComponent = 1
        // ContextConsumer = 9
        // ForwardRef = 11
        // MemoComponent = 14
        // SimpleMemoComponent = 15
        this.user = node.tag === 0 || node.tag === 1 ||
            node.tag === 9 || node.tag === 11 ||
            node.tag === 14 || node.tag === 15

        this.key = node.key ?? node.index
        if (this.user)
        {
            let type = typeof node.type

            if (type === "function") this.name = node.type.name
            else this.name = node.type.displayName ?? node.type.render.displayName ?? null

            this.state = node.memoizedState
            this.props = node.memoizedProps
        }
    }


    private previous: ReactNode | null = null
    public get updateState(): UpdateState
    {
        if (this.previous === null) return UpdateState.MOUNTED // Component previously didn't exist

        // Component rerenders if it's state or props changed
        return this.previous.state !== this.state || this.previous.props !== this.props ||
            this.previous.node.ref !== this.node.ref ?
            UpdateState.RERENDER : UpdateState.NONE
    }

    // Given the previous tree, identify analogous nodes
    public compare(node: ReactNode)
    {
        if (this.node.type !== node.node.type) return

        this.previous = node
        for (let i = 0; i < this.children.length; i++)
        {
            let child = this.children[i]
            if (child === undefined) continue

            let previous: ReactNode | null = node.children.find(c => c.key === child.key) ?? null
            if (previous !== null) child.compare(previous)
        }
    }

    private colorString(r: number, g: number, b: number, a: number = 1): string
    {
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")"
    }

    public render()
    {
        if (this.user && this.updateState !== UpdateState.NONE) for (let element of this.findHTML())
        {
            let color = this.updateState === UpdateState.MOUNTED ? MOUNTED_COLOR : UPDATE_COLOR
            window.requestAnimationFrame(() =>
            {
                element.style.outline = "2px solid " + this.colorString(...color)
                element.style.transition = "outline 0s"

                window.requestAnimationFrame(() =>
                {
                    element.style.outline = "2px solid " + this.colorString(...color, 0)
                    element.style.transition = "outline 1.5s linear"
                })
            })
        }

        for (let child of this.children) child.render()
    }

    private findHTML(): HTMLElement[]
    {
        if (!this.user) return this.node.stateNode instanceof HTMLElement ? [ this.node.stateNode ] : []

        let elements: HTMLElement[] = []
        for (let child of this.children) elements.push(...child.findHTML())

        return elements
    }


    public toString(level: number = 0): string
    {
        let result = ""
        if (this.user)
        {
            for (let i = 0; i < level; i++) result += "| "
            switch (this.updateState)
            {
                case UpdateState.RERENDER: result += "[] "; break
                case UpdateState.MOUNTED: result += "=> "; break
            }

            result += this.name + "\n"
        }
        else level--

        result += this.children.map(node => node.toString(level + 1)).join("")
        return result
    }

    public fullTreeString(level: number = 0): string
    {
        let result = ""
        for (let i = 0; i < level; i++) result += "| "

        result += this.name + "\n"
        result += this.children.map(node => node.fullTreeString(level + 1)).join("")

        return result
    }

}

main()
async function main()
{
    // Make sure React developer tools are accessible
    // @ts-ignore
    let devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    if (!devTools) return void console.error("React developer tools not found")

    // Intercepts arguments of function and passes them on
    function inject(original: (...args: any[]) => any, fn: (...args: any[]) => void): (...args: any[]) => any
    {
        return function (...args: any[])
        {
            fn(...args)
            return original(...args)
        }
    }

    function traverse(node: any, parent: ReactNode | null, children: ReactNode[])
    {
        let child = new ReactNode(node, parent)
        children.push(child)

        if (node.child) traverse(node.child, child, child.children)
        if (node.sibling) traverse(node.sibling, parent, children)
    }

    // onCommitFiberRoot is called by React whenever the virtual DOM tree updates
    // This is where rerendering is detected
    let node: ReactNode | null = null
    devTools.onCommitFiberRoot = inject(devTools.onCommitFiberRoot, (...args) =>
    {
        // Convert React Fiber structure to object
        let nodes: ReactNode[] = []
        traverse(args[1].current, null, nodes)

        let previous = node
        node = nodes[0]

        // TODO: Initial render cannot be detected
        // Tried using flags on FiberNode, but wasn't able to reliably detect rerendering
        if (previous === null) return
        node.compare(previous)
        node.render()

        // console.log(node.toString())
    })
}
})()
