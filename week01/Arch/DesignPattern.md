# Design Pattern

### Decorator

```typescript
namespace DecoratorPattern {
  export interface Component {
    operation(): void;
  }

  export class ConcreteComponent implements Component {
    private s: String;

    constructor(s: String) {
      this.s = s;
    }

    public operation(): void {
      console.log(
        "`operation` of ConcreteComponent",
        this.s,
        " is being called!"
      );
    }
  }

  export class Decorator implements Component {
    private component: Component;
    private id: Number;

    constructor(id: Number, component: Component) {
      this.id = id;
      this.component = component;
    }

    public get Id(): Number {
      return this.id;
    }

    public operation(): void {
      console.log("`operation` of Decorator", this.id, " is being called!");
      this.component.operation();
    }
  }

  export class ConcreteDecorator extends Decorator {
    constructor(id: Number, component: Component) {
      super(id, component);
    }

    public operation(): void {
      super.operation();
      console.log(
        "`operation` of ConcreteDecorator",
        this.Id,
        " is being called!"
      );
    }
  }
}
```

```typescript
/// <reference path="decorator.ts" />
namespace DecoratorPattern {
	export namespace Demo {

		export function show() : void {
			var decorator1: DecoratorPattern.Decorator = new DecoratorPattern.ConcreteDecorator(1, new DecoratorPattern.ConcreteComponent("Comp1"));

			decorator1.operation();
		}
	}
}
```



### Observer

```typescript
namespace ObserverPattern {
    export class Subject {
        private observers: Observer[] = [];

        public register(observer: Observer): void {
            console.log(observer, "is pushed!");
            this.observers.push(observer);
        }

        public unregister(observer: Observer): void {
            var n: number = this.observers.indexOf(observer);
            console.log(observer, "is removed");
            this.observers.splice(n, 1);
        }

        public notify(): void {
            console.log("notify all the observers", this.observers);
            var i: number
              , max: number;

            for (i = 0, max = this.observers.length; i < max; i += 1) {
                this.observers[i].notify();
            }
        }
    }

    export class ConcreteSubject extends Subject {
        private subjectState: number;

        get SubjectState(): number {
            return this.subjectState;
        }

        set SubjectState(subjectState: number) {
            this.subjectState = subjectState;
        }
    }

    export abstract class Observer {
        notify(): void {}
    }

    export class ConcreteObserver extends Observer {
        private name: string;
        private state: number;
        private subject: ConcreteSubject;

        constructor (subject: ConcreteSubject, name: string) {
            super();
            console.log("ConcreteObserver", name, "is created!");
            this.subject = subject;
            this.name = name;
        }

        public notify(): void {
            console.log("ConcreteObserver's notify method");
            console.log(this.name, this.state);
            this.state = this.subject.SubjectState;
        }

        get Subject(): ConcreteSubject {
            return this.subject;
        }

        set Subject(subject: ConcreteSubject) {
            this.subject = subject;
        }
    }
}
```



```typescript
/// <reference path="observer.ts" />
namespace ObserverPattern {
	export namespace Demo {

		export function show() : void {
			var sub: ObserverPattern.ConcreteSubject = new ObserverPattern.ConcreteSubject();

			sub.register(new ObserverPattern.ConcreteObserver(sub, "Jancsi"));
			sub.register(new ObserverPattern.ConcreteObserver(sub, "Julcsa"));
			sub.register(new ObserverPattern.ConcreteObserver(sub, "Marcsa"));

			sub.SubjectState = 123;
			sub.notify();
		}
	}
}
```

